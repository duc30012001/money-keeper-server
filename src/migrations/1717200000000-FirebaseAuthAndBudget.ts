import { MigrationInterface, QueryRunner } from 'typeorm';

export class FirebaseAuthAndBudget1717200000000 implements MigrationInterface {
	name = 'FirebaseAuthAndBudget1717200000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		// ─── User table: Remove password, add Firebase fields ───
		// Check if password column exists before dropping
		const hasPassword = await queryRunner.hasColumn('users', 'password');
		if (hasPassword) {
			await queryRunner.query(
				`ALTER TABLE "users" DROP COLUMN IF EXISTS "password"`,
			);
		}

		// Add Firebase fields
		const hasFirebaseUid = await queryRunner.hasColumn(
			'users',
			'firebase_uid',
		);
		if (!hasFirebaseUid) {
			await queryRunner.query(
				`ALTER TABLE "users" ADD "firebase_uid" varchar(128) NULL`,
			);
			await queryRunner.query(
				`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_firebase_uid" UNIQUE ("firebase_uid")`,
			);
		}

		const hasDisplayName = await queryRunner.hasColumn(
			'users',
			'display_name',
		);
		if (!hasDisplayName) {
			await queryRunner.query(
				`ALTER TABLE "users" ADD "display_name" varchar(255) NULL`,
			);
		}

		const hasPhotoUrl = await queryRunner.hasColumn('users', 'photo_url');
		if (!hasPhotoUrl) {
			await queryRunner.query(
				`ALTER TABLE "users" ADD "photo_url" text NULL`,
			);
		}

		// ─── Budget table ───
		// Create budget_period enum
		await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "budget_period_enum" AS ENUM('month', 'year');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

		// Create budgets table
		await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "budgets" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "creator_id" uuid NOT NULL,
                "period" "budget_period_enum" NOT NULL,
                "year" integer NOT NULL,
                "month" integer,
                "amount" numeric(18,2) NOT NULL,
                "category_id" uuid,
                "description" text,
                CONSTRAINT "PK_budgets" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_budgets_creator_period" UNIQUE ("creator_id", "period", "year", "month", "category_id")
            )
        `);

		// Add foreign keys
		const hasBudgetsTable = await queryRunner.hasTable('budgets');
		if (hasBudgetsTable) {
			// FK to users
			await queryRunner.query(`
                DO $$ BEGIN
                    ALTER TABLE "budgets"
                        ADD CONSTRAINT "FK_budgets_creator"
                        FOREIGN KEY ("creator_id") REFERENCES "users"("id")
                        ON DELETE CASCADE ON UPDATE NO ACTION;
                EXCEPTION WHEN duplicate_object THEN null;
                END $$;
            `);

			// FK to categories
			await queryRunner.query(`
                DO $$ BEGIN
                    ALTER TABLE "budgets"
                        ADD CONSTRAINT "FK_budgets_category"
                        FOREIGN KEY ("category_id") REFERENCES "categories"("id")
                        ON DELETE SET NULL ON UPDATE NO ACTION;
                EXCEPTION WHEN duplicate_object THEN null;
                END $$;
            `);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Drop budgets table
		await queryRunner.query(
			`ALTER TABLE "budgets" DROP CONSTRAINT IF EXISTS "FK_budgets_category"`,
		);
		await queryRunner.query(
			`ALTER TABLE "budgets" DROP CONSTRAINT IF EXISTS "FK_budgets_creator"`,
		);
		await queryRunner.query(`DROP TABLE IF EXISTS "budgets"`);
		await queryRunner.query(`DROP TYPE IF EXISTS "budget_period_enum"`);

		// Revert user table
		await queryRunner.query(
			`ALTER TABLE "users" DROP COLUMN IF EXISTS "photo_url"`,
		);
		await queryRunner.query(
			`ALTER TABLE "users" DROP COLUMN IF EXISTS "display_name"`,
		);
		await queryRunner.query(
			`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_firebase_uid"`,
		);
		await queryRunner.query(
			`ALTER TABLE "users" DROP COLUMN IF EXISTS "firebase_uid"`,
		);
		await queryRunner.query(
			`ALTER TABLE "users" ADD "password" varchar(255) NULL`,
		);
	}
}
