-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pilot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "certificateNumber" TEXT,
    "defaultTailId" TEXT,
    "managementCompanyId" TEXT NOT NULL,
    CONSTRAINT "Pilot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pilot_defaultTailId_fkey" FOREIGN KEY ("defaultTailId") REFERENCES "Aircraft" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Pilot_managementCompanyId_fkey" FOREIGN KEY ("managementCompanyId") REFERENCES "ManagementCompany" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ManagementCompany" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "primaryContact" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Aircraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tailNumber" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "avgFuelBurnPerHour" REAL,
    "managementCompanyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Aircraft_managementCompanyId_fkey" FOREIGN KEY ("managementCompanyId") REFERENCES "ManagementCompany" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Fbo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icaoCode" TEXT NOT NULL,
    "airportName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "fuelSupplier" TEXT,
    "ownershipType" TEXT,
    "chainName" TEXT,
    "isFlightsheetPartner" BOOLEAN NOT NULL DEFAULT false,
    "partnerSince" DATETIME,
    "currentRetailPPG" REAL,
    "lastPriceUpdate" DATETIME,
    "agreementStatus" TEXT NOT NULL DEFAULT 'PROSPECT',
    "latitude" REAL,
    "longitude" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FuelPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pilotId" TEXT NOT NULL,
    "aircraftId" TEXT NOT NULL,
    "fboId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "gallons" REAL NOT NULL,
    "pricePerGallon" REAL NOT NULL,
    "retailPriceAtTime" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "savingsAmount" REAL NOT NULL,
    "fuelType" TEXT NOT NULL DEFAULT 'Jet-A',
    "receiptImageUrl" TEXT,
    "receiptRawText" TEXT,
    "extractedByAI" BOOLEAN NOT NULL DEFAULT false,
    "confirmedByPilot" BOOLEAN NOT NULL DEFAULT false,
    "invoiceNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FuelPurchase_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FuelPurchase_aircraftId_fkey" FOREIGN KEY ("aircraftId") REFERENCES "Aircraft" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FuelPurchase_fboId_fkey" FOREIGN KEY ("fboId") REFERENCES "Fbo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fboId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Survey_fboId_fkey" FOREIGN KEY ("fboId") REFERENCES "Fbo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SurveyQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "surveyId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "options" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isConditional" BOOLEAN NOT NULL DEFAULT false,
    "conditionQuestionId" TEXT,
    "conditionAnswer" TEXT,
    "displayOrder" INTEGER NOT NULL,
    CONSTRAINT "SurveyQuestion_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SurveyQuestion_conditionQuestionId_fkey" FOREIGN KEY ("conditionQuestionId") REFERENCES "SurveyQuestion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeedbackResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fuelPurchaseId" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "pilotId" TEXT NOT NULL,
    "fboId" TEXT NOT NULL,
    "aircraftId" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completionTimeSeconds" INTEGER,
    "turnScore" REAL,
    "serviceScore" REAL,
    "commScore" REAL,
    "npsScore" INTEGER,
    "wouldReturn" TEXT,
    "departureStatus" TEXT,
    "greetingReceived" TEXT,
    "preArrivalContact" BOOLEAN,
    "keptInformed" BOOLEAN,
    "commentText" TEXT,
    "photoUrl" TEXT,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "flaggedAt" DATETIME,
    "flagReason" TEXT,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT,
    "resolutionNote" TEXT,
    CONSTRAINT "FeedbackResponse_fuelPurchaseId_fkey" FOREIGN KEY ("fuelPurchaseId") REFERENCES "FuelPurchase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeedbackResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeedbackResponse_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeedbackResponse_fboId_fkey" FOREIGN KEY ("fboId") REFERENCES "Fbo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeedbackResponse_aircraftId_fkey" FOREIGN KEY ("aircraftId") REFERENCES "Aircraft" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SurveyAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "responseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT,
    "answerNumeric" REAL,
    "answerBoolean" BOOLEAN,
    "answerOptions" TEXT,
    CONSTRAINT "SurveyAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "FeedbackResponse" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SurveyAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SurveyQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlightbridgeSync" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fboId" TEXT NOT NULL,
    "tailNumber" TEXT NOT NULL,
    "inboundEta" DATETIME,
    "gallonsRequested" REAL,
    "serviceRequests" TEXT,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "FlightbridgeSync_fboId_fkey" FOREIGN KEY ("fboId") REFERENCES "Fbo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "relatedId" TEXT,
    "relatedType" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PricingTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fboId" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "minGallons" REAL NOT NULL,
    "maxGallons" REAL NOT NULL,
    "pricePerGallon" REAL NOT NULL,
    "effectiveDate" DATETIME NOT NULL,
    "expiryDate" DATETIME,
    CONSTRAINT "PricingTier_fboId_fkey" FOREIGN KEY ("fboId") REFERENCES "Fbo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fboId" TEXT NOT NULL,
    "retailPPG" REAL NOT NULL,
    "flightsheetPPG" REAL NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeAmount" REAL,
    "changePercent" REAL,
    CONSTRAINT "PriceHistory_fboId_fkey" FOREIGN KEY ("fboId") REFERENCES "Fbo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pilot_userId_key" ON "Pilot"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ManagementCompany_name_key" ON "ManagementCompany"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Aircraft_tailNumber_key" ON "Aircraft"("tailNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Fbo_icaoCode_key" ON "Fbo"("icaoCode");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackResponse_fuelPurchaseId_key" ON "FeedbackResponse"("fuelPurchaseId");
