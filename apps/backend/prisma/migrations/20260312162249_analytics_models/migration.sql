-- CreateTable
CREATE TABLE "card_views" (
    "id" TEXT NOT NULL,
    "card_id" TEXT,
    "owner_id" TEXT NOT NULL,
    "viewer_id" TEXT,
    "viewer_ip" TEXT,
    "viewer_agent" TEXT,
    "source" TEXT NOT NULL DEFAULT 'qr',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_logs" (
    "id" TEXT NOT NULL,
    "follower_id" TEXT NOT NULL,
    "target_username" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'success',
    "layer" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "card_views" ADD CONSTRAINT "card_views_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_views" ADD CONSTRAINT "card_views_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_views" ADD CONSTRAINT "card_views_viewer_id_fkey" FOREIGN KEY ("viewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_logs" ADD CONSTRAINT "follow_logs_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
