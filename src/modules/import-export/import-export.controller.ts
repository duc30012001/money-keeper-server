import { Body, Controller, Get, Header, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { ResponseDto } from 'src/common/dtos/response.dto';
import {
	ImportResultDto,
	ImportTransactionsDto,
} from './dtos/import-transaction.dto';
import { ImportExportService } from './import-export.service';

@ApiTags('Import/Export')
@Controller('import-export')
export class ImportExportController {
	constructor(private readonly importExportService: ImportExportService) {}

	@Get('template')
	@ApiOperation({ summary: 'Download transaction import template' })
	@ApiProduces(
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	)
	@Header(
		'Content-Type',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	)
	@Header(
		'Content-Disposition',
		'attachment; filename=transaction_import_template.xlsx',
	)
	async downloadTemplate(
		@Req() req: Request,
		@Res() res: Response,
	): Promise<void> {
		const creatorId = req.user?.sub as string;
		const buffer =
			await this.importExportService.generateTemplate(creatorId);
		res.send(Buffer.from(buffer));
	}

	@Post('import')
	@ApiOperation({ summary: 'Import transactions from parsed Excel data' })
	async importTransactions(
		@Body() dto: ImportTransactionsDto,
		@Req() req: Request,
	): Promise<ResponseDto<ImportResultDto>> {
		const creatorId = req.user?.sub as string;
		const result = await this.importExportService.importTransactions(
			dto.rows,
			creatorId,
		);
		return new ResponseDto(result);
	}
}
