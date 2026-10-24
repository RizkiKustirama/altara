CREATE TYPE "public"."user_role" AS ENUM('OWNER', 'PLANNER', 'CREW');--> statement-breakpoint
CREATE TYPE "public"."logistics_status" AS ENUM('NOT_RECEIVED', 'WITH_CREW', 'AT_STAGE', 'RETURNED_TO_FAMILY');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('LEAD', 'PLANNING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('INQUIRY', 'BOOKED', 'DP_PAID', 'SETTLED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."vendor_category" AS ENUM('MUA', 'DECORATION', 'CATERING', 'PHOTO_VIDEO', 'SOUND_LIGHTING', 'VENUE', 'MC', 'ATTIRE', 'ENTERTAINMENT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."rundown_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('PENDING', 'PAID');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'CREW' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" numeric,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sacred_belongings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"item_name" text NOT NULL,
	"current_location" text NOT NULL,
	"current_holder_id" uuid,
	"status" "logistics_status" DEFAULT 'NOT_RECEIVED' NOT NULL,
	"notes" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_name" text NOT NULL,
	"package_type" text NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"included_services" text NOT NULL,
	"excluded_services" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_id" uuid,
	"project_name" text NOT NULL,
	"client_groom_name" text NOT NULL,
	"client_bride_name" text NOT NULL,
	"wedding_date" date NOT NULL,
	"venue_name" text NOT NULL,
	"venue_address" text,
	"contract_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"public_token" text NOT NULL,
	"status" "project_status" DEFAULT 'PLANNING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_public_token_unique" UNIQUE("public_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_crews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"event_date" date NOT NULL,
	"role_in_project" text NOT NULL,
	"shift_start" time,
	"shift_end" time,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_crew_event_date" UNIQUE("user_id","event_date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"category" "vendor_category" NOT NULL,
	"contract_status" "contract_status" DEFAULT 'INQUIRY' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_name" text NOT NULL,
	"category" "vendor_category" NOT NULL,
	"pic_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_name" text NOT NULL,
	"ceremony_type" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_rundowns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"pic_role" text,
	"music_cue" text,
	"lighting_cue" text,
	"status" "rundown_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "template_rundown_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"pic_role" text,
	"music_cue" text,
	"lighting_cue" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wedding_parties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"relationship" text NOT NULL,
	"phone" text,
	"ceremonial_role" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"due_date" date NOT NULL,
	"paid_date" date,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"proof_file_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"category" text NOT NULL,
	"allocated_amount" numeric(12, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendor_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_vendor_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"due_date" date NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"invoice_file_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "company_finances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"gross_contract_price" numeric(12, 2) NOT NULL,
	"vendor_real_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"crew_total_expense" numeric(12, 2) DEFAULT '0' NOT NULL,
	"net_profit_margin" numeric(12, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_finances_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crew_payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"daily_rate" numeric(10, 2) NOT NULL,
	"session_count" numeric(4, 1) DEFAULT '1.0' NOT NULL,
	"total_payout" numeric(10, 2) NOT NULL,
	"payout_status" "payout_status" DEFAULT 'PENDING' NOT NULL,
	"paid_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sacred_belongings" ADD CONSTRAINT "sacred_belongings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sacred_belongings" ADD CONSTRAINT "sacred_belongings_current_holder_id_users_id_fk" FOREIGN KEY ("current_holder_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_package_id_service_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."service_packages"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_crews" ADD CONSTRAINT "project_crews_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_crews" ADD CONSTRAINT "project_crews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_vendors" ADD CONSTRAINT "project_vendors_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_vendors" ADD CONSTRAINT "project_vendors_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_rundowns" ADD CONSTRAINT "project_rundowns_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "template_rundown_items" ADD CONSTRAINT "template_rundown_items_template_id_event_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."event_templates"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wedding_parties" ADD CONSTRAINT "wedding_parties_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_milestones" ADD CONSTRAINT "payment_milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_budgets" ADD CONSTRAINT "project_budgets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_invoices" ADD CONSTRAINT "vendor_invoices_project_vendor_id_project_vendors_id_fk" FOREIGN KEY ("project_vendor_id") REFERENCES "public"."project_vendors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "company_finances" ADD CONSTRAINT "company_finances_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crew_payouts" ADD CONSTRAINT "crew_payouts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crew_payouts" ADD CONSTRAINT "crew_payouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_projects_public_token" ON "projects" USING btree ("public_token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_projects_wedding_date" ON "projects" USING btree ("wedding_date","id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_company_finances_project_id" ON "company_finances" USING btree ("project_id");