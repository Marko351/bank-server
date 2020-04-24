'use strict';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { AbstractDto } from 'common/dto';
import { BillEntity } from 'modules/bill/entities';
import { CurrencyDto } from 'modules/currency/dto';

export class BillDto extends AbstractDto {
    @ApiProperty()
    readonly accountBillNumber: string;

    @ApiPropertyOptional()
    @IsOptional()
    readonly amountMoney?: number;

    @ApiProperty({ type: CurrencyDto })
    readonly currency: CurrencyDto;

    constructor(bill: BillEntity) {
        super(bill);
        this.amountMoney = bill.amountMoney;
        this.accountBillNumber = bill.accountBillNumber;
        this.currency = bill.currency.toDto();
    }
}
