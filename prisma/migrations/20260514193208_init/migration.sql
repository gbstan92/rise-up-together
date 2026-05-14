-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('RO', 'EN');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('UPCOMING', 'PAST');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('NEW', 'HANDLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PageKey" AS ENUM ('HOME', 'WHO_WE_ARE', 'WHAT_WE_DO', 'GET_INVOLVED', 'PRIVACY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageContent" (
    "id" TEXT NOT NULL,
    "key" "PageKey" NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageContentTranslation" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDesc" TEXT,

    CONSTRAINT "PageContentTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "photoId" TEXT,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMemberTranslation" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT NOT NULL,

    CONSTRAINT "TeamMemberTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "phase" "TournamentStatus" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "venueName" TEXT NOT NULL,
    "venueAddress" TEXT NOT NULL,
    "registrationOpen" BOOLEAN NOT NULL DEFAULT false,
    "coverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentTranslation" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "slugLocale" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" JSONB NOT NULL,
    "seoTitle" TEXT,
    "seoDesc" TEXT,

    CONSTRAINT "TournamentTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoEmbed" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "titleRo" TEXT,
    "titleEn" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VideoEmbed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentTeam" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TournamentTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchResult" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "round" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    "playedAt" TIMESTAMP(3),

    CONSTRAINT "MatchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerSubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "interests" TEXT NOT NULL,
    "message" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorInquiry" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "tier" TEXT,
    "message" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SponsorInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmToken" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "unsubToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamRegistration" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "captainName" TEXT NOT NULL,
    "captainEmail" TEXT NOT NULL,
    "captainPhone" TEXT,
    "playerCount" INTEGER NOT NULL,
    "notes" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "decidedAt" TIMESTAMP(3),
    "decidedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "variants" JSONB NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "altRo" TEXT,
    "altEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TournamentGallery" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TournamentGallery_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PageContent_key_key" ON "PageContent"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PageContentTranslation_pageId_locale_key" ON "PageContentTranslation"("pageId", "locale");

-- CreateIndex
CREATE INDEX "ContentBlock_pageId_sortOrder_idx" ON "ContentBlock"("pageId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMemberTranslation_memberId_locale_key" ON "TeamMemberTranslation"("memberId", "locale");

-- CreateIndex
CREATE INDEX "Tournament_phase_status_startDate_idx" ON "Tournament"("phase", "status", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTranslation_tournamentId_locale_key" ON "TournamentTranslation"("tournamentId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTranslation_locale_slugLocale_key" ON "TournamentTranslation"("locale", "slugLocale");

-- CreateIndex
CREATE INDEX "VideoEmbed_tournamentId_sortOrder_idx" ON "VideoEmbed"("tournamentId", "sortOrder");

-- CreateIndex
CREATE INDEX "TournamentTeam_tournamentId_idx" ON "TournamentTeam"("tournamentId");

-- CreateIndex
CREATE INDEX "MatchResult_tournamentId_round_idx" ON "MatchResult"("tournamentId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_confirmToken_key" ON "NewsletterSubscriber"("confirmToken");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_unsubToken_key" ON "NewsletterSubscriber"("unsubToken");

-- CreateIndex
CREATE INDEX "TeamRegistration_tournamentId_status_idx" ON "TeamRegistration"("tournamentId", "status");

-- CreateIndex
CREATE INDEX "_TournamentGallery_B_index" ON "_TournamentGallery"("B");

-- AddForeignKey
ALTER TABLE "PageContentTranslation" ADD CONSTRAINT "PageContentTranslation_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "PageContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "PageContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMemberTranslation" ADD CONSTRAINT "TeamMemberTranslation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTranslation" ADD CONSTRAINT "TournamentTranslation_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoEmbed" ADD CONSTRAINT "VideoEmbed_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "TournamentTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "TournamentTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRegistration" ADD CONSTRAINT "TeamRegistration_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TournamentGallery" ADD CONSTRAINT "_TournamentGallery_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TournamentGallery" ADD CONSTRAINT "_TournamentGallery_B_fkey" FOREIGN KEY ("B") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
