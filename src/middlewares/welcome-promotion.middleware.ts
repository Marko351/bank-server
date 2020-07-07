import { Injectable, NestMiddleware } from '@nestjs/common';
import { RoleType } from 'common/constants';
import { NextFunction, Response } from 'express';
import { IUserLoginBodyRequest } from 'interfaces';
import { BillService } from 'modules/bill/services';
import { TransactionService } from 'modules/transaction/services';
import { UserAuthService } from 'modules/user/services';
import { Language } from 'common/constants/language.constant';

@Injectable()
export class WelcomePromotionMiddleware implements NestMiddleware {
  private readonly _promotionValue = 5;
  private readonly _promotionTransferTitle = `Thank you for registering! :)`;
  private readonly _promotionKey = `WELCOME5`;

  constructor(
    private readonly _billService: BillService,
    private readonly _transactionService: TransactionService,
    private readonly _userAuthService: UserAuthService,
  ) {}

  public async use(
    req: IUserLoginBodyRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { pinCode } = req.body;
    const [user, rootUser] = await Promise.all([
      this._userAuthService.findUserAuth({ pinCode }),
      this._userAuthService.findUserAuth({ role: RoleType.ADMIN }),
    ]);

    if (!user || !rootUser) {
      return next();
    }

    const transaction = await this._transactionService.getTransaction({
      recipient: user,
      authorizationKey: this._promotionKey,
    });

    if (transaction) {
      return next();
    }

    const [senderBill, recipientBill] = await Promise.all([
      this._billService.getBill(rootUser),
      this._billService.getBill(user),
    ]);

    const createdTransaction = {
      amountMoney: this._promotionValue,
      transferTitle: this._promotionTransferTitle,
      recipientBill: recipientBill.uuid,
      senderBill: senderBill.uuid,
      locale: Language.EN,
    };

    await this._transactionService.createTransaction(
      rootUser,
      createdTransaction,
      this._promotionKey,
    );
    await this._transactionService.confirmTransaction(rootUser, {
      authorizationKey: this._promotionKey,
    });

    next();
  }
}