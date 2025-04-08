import { eq, and, or, not } from "drizzle-orm";
import { EmployeeClassification, matchUserEmail, matchUserName, User } from "../user";
import { db } from "./drizzle";
import { claimsTable, lineManagersTable, usersTable } from "./schema";
import { GeneralStaff } from "../employee/generalStaff";
import { Claim, ClaimStatus } from "../claims/claim";
import { EmployeeRole, EmployeeType } from "../employee/employeeRole";
import { LineManager } from "../employee/lineManager";
import { Administrator } from "../employee/administrator";
import { PayrollOfficer } from "../employee/payrollOfficer";
import { Consultant } from "../employee/consultant";
import bcrypt from "bcryptjs";
import fs from "fs";

/**
 * Used to represent the database as a phyiscial class. 
 */
export class DatabaseManager {
  static #instance: DatabaseManager;
  private fileStoragePath = "./backend/db/fileStorage";

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!this.#instance) {
      this.#instance = new DatabaseManager();
    }
    return this.#instance;
  }

  /**
   * Login with username and password and return user
   * */
  async Login(email: string, password: string): Promise<User | null> {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (result.length != 1) return null;

    const comparePasswords = bcrypt.compareSync(
      password,
      result[0].hashedPassword
    );
    if (!comparePasswords) {
      console.log("Incorrect password");
      return null;
    }

    return this.getAccount(result[0].id);
  }

  /**
   * Register a new admin user with email and password
   * Don't register if email already exists or admnistrator already exists. Administrators should create accounts
   */
  async Register(
    email: string,
    password: string,
    isSuperUser?: boolean
  ): Promise<User | null> {
    const result = await db
      .select()
      .from(usersTable)
      .where(
        or(
          eq(usersTable.email, email),
          eq(usersTable.employeeRole, "Administrator")
        )
      );
    if (result.length != 0 && !isSuperUser) return null;

    const hashedPassword = await bcrypt.hash(password, 10);
    const insert = await db
      .insert(usersTable)
      .values({
        firstName: "FirstName",
        familyName: "FamilyName",
        region: "UK",
        email: email,
        hashedPassword: hashedPassword,
        employeeClassification: "Internal",
        employeeRole: "Administrator",
      })
      .returning();

    console.log("DatabaseManager", "Register", insert);

    if (insert.length != 1) return null;

    return this.getAccount(insert[0].id);
  }

  public async getAllAccounts(): Promise<User[]> {
    try {
      const userRows = await db.select().from(usersTable);

      const users = [];
      for (let i = 0; i < userRows.length; i++) {
        const userRow = userRows[i];
        const employeeRole = await this.getEmployeeRole(
          userRow.id,
          userRow.employeeRole as EmployeeType
        );
        if (!employeeRole) {
          console.error(
            "DatabaseManager",
            "Failed to get employee role for user",
            userRow.id
          );
          continue;
        }
        users.push(
          new User({
            email: userRow.email,
            id: userRow.id,
            createdAt: userRow.createdAt,
            firstName: userRow.firstName,
            familyName: userRow.familyName,
            employeeClassification:
              userRow.employeeClassification === "Internal"
                ? EmployeeClassification.Internal
                : EmployeeClassification.External,
            region: userRow.region,
            employeeRole: employeeRole,
          })
        );
      }

      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  async getUsersForRegion(region: string): Promise<User[]> {
    const userRows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.region, region));
    const users = [];
    for (let i = 0; i < userRows.length; i++) {
      const userRow = userRows[i];
      const employeeRole = await this.getEmployeeRole(
        userRow.id,
        userRow.employeeRole as EmployeeType
      );
      if (!employeeRole) {
        console.error(
          "DatabaseManager",
          "Failed to get employee role for user",
          userRow.id
        );
        continue;
      }
      users.push(
        new User({
          email: userRow.email,
          id: userRow.id,
          createdAt: userRow.createdAt,
          firstName: userRow.firstName,
          familyName: userRow.familyName,
          employeeClassification:
            userRow.employeeClassification === "Internal"
              ? EmployeeClassification.Internal
              : EmployeeClassification.External,
          region: userRow.region,
          employeeRole: employeeRole,
        })
      );
    }

    return users;
  }

  async addAccount(user: User, password: string): Promise<User | null> {
    const insert = await db
      .insert(usersTable)
      .values({
        firstName: user.getFirstName(),
        familyName: user.getFamilyName(),
        email: user.getEmail(),
        hashedPassword: await bcrypt.hash(password, 10),
        employeeClassification:
          user.getEmployeeClassification() === EmployeeClassification.Internal
            ? "Internal"
            : "External",
        employeeRole: user.getEmployeeRole().getType(),
        region: user.getRegion(),
      })
      .returning();

    if (insert.length !== 1) {
      return null;
    }

    const employeeRole = await this.getEmployeeRole(
      insert[0].id,
      user.getEmployeeRole().getType()
    );
    if (!employeeRole) {
      return null;
    }

    return new User({
      id: insert[0].id,
      createdAt: insert[0].createdAt,
      firstName: insert[0].firstName,
      familyName: insert[0].familyName,
      email: insert[0].email,
      employeeClassification:
        insert[0].employeeClassification === "Internal"
          ? EmployeeClassification.Internal
          : EmployeeClassification.External,
      region: insert[0].region,
      employeeRole: employeeRole,
    });
  }

  async getEmployeeRole(
    userId: number,
    employeeType: EmployeeType
  ): Promise<EmployeeRole | null> {
    let employeeRole: EmployeeRole | null = null;
    switch (employeeType) {
      case EmployeeType.LineManager:
        const employees = await this.getManagersEmployees(userId);
        employeeRole = new LineManager(userId, employees);
        break;
      case EmployeeType.Administrator:
        employeeRole = new Administrator(userId);
        break;
      case EmployeeType.GeneralStaff:
        employeeRole = new GeneralStaff(userId);
        break;
      case EmployeeType.PayrollOfficer:
        employeeRole = new PayrollOfficer(userId);
        break;
      case EmployeeType.Consultant:
        employeeRole = new Consultant(userId);
        break;
      default:
        console.error("DatabaseManager", "Unknown employee type");
    }

    return employeeRole;
  }

  async getAccount(userId: number): Promise<User | null> {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    if (result.length === 0 || result.length > 1) {
      return null;
    }

    const employeeRole = await this.getEmployeeRole(
      result[0].id,
      result[0].employeeRole as EmployeeType
    );
    if (!employeeRole) {
      return null;
    }
    if (employeeRole) {
      const lineManager = await this.getLineManager(userId);
      if (lineManager) {
        employeeRole.setLineManager(lineManager);
      } else {
        console.warn(
          "DatabaseManager",
          "No line manager found for user",
          userId
        );
      }
    }

    return new User({
      id: result[0].id,
      createdAt: result[0].createdAt,
      firstName: result[0].firstName,
      familyName: result[0].familyName,
      email: result[0].email,
      employeeClassification:
        result[0].employeeClassification === "Internal"
          ? EmployeeClassification.Internal
          : EmployeeClassification.External,
      region: result[0].region,
      employeeRole: employeeRole,
    });
  }

  async deleteAccount(userId: number): Promise<boolean> {
    const deleteUser = await db
      .delete(usersTable)
      .where(
        and(
          eq(usersTable.id, userId),
          not(eq(usersTable.employeeRole, "Administrator"))
        )
      )
      .returning();
    if (deleteUser.length === 0) {
      return false;
    }

    if (deleteUser[0].lineManagerId) {
      const deleteLineManager = await db
        .delete(lineManagersTable)
        .where(
          or(
            eq(lineManagersTable.lineManagerId, userId),
            eq(lineManagersTable.employeeId, userId)
          )
        )
        .returning();
      if (deleteLineManager.length === 0) {
        return false;
      }
    }

    return true;
  }

  async getManagersEmployees(managerUserId: number): Promise<User[]> {
    const employees = await db
      .select()
      .from(lineManagersTable)
      .where(eq(lineManagersTable.lineManagerId, managerUserId))
      .innerJoin(usersTable, eq(lineManagersTable.employeeId, usersTable.id));
    console.log(
      "DatabaseManager",
      "getManagersEmployees",
      managerUserId,
      employees
    );
    const userRows = employees.map((row) => row.users_table);
    const users = [];
    for (let i = 0; i < userRows.length; i++) {
      const userRow = userRows[i];
      const employeeRole = await this.getEmployeeRole(
        userRow.id,
        userRow.employeeRole as EmployeeType
      );
      if (!employeeRole) {
        console.error(
          "DatabaseManager",
          "Failed to get employee role for user",
          userRow.id
        );
        continue;
      }
      users.push(
        new User({
          email: userRow.email,
          id: userRow.id,
          createdAt: userRow.createdAt,
          firstName: userRow.firstName,
          familyName: userRow.familyName,
          employeeClassification:
            userRow.employeeClassification === "Internal"
              ? EmployeeClassification.Internal
              : EmployeeClassification.External,
          region: userRow.region,
          employeeRole: employeeRole,
        })
      );
    }

    return users;
  }

  async getLineManager(employeeUserId: number): Promise<User | null> {
    const lineManager = await db
      .select()
      .from(lineManagersTable)
      .where(eq(lineManagersTable.employeeId, employeeUserId));
    console.log(
      "DatabaseManager",
      "getLineManager",
      employeeUserId,
      lineManager
    );
    if (lineManager.length !== 1) {
      return null;
    }

    return this.getAccount(lineManager[0].lineManagerId);
  }

  async setLineManager(
    employeeUserId: number,
    managerUserId: number
  ): Promise<boolean> {
    const updateUser = await db
      .update(usersTable)
      .set({
        lineManagerId: managerUserId,
      })
      .where(eq(usersTable.id, employeeUserId))
      .returning();

    if (!updateUser) {
      return false;
    }

    const createLineManager = await db
      .insert(lineManagersTable)
      .values({
        employeeId: employeeUserId,
        lineManagerId: managerUserId,
      })
      .returning();

    return createLineManager.length === 1;
  }

  /**
   * Sets the employee classifcation (Internal / External) for the user.
   * If the user already has the same classification, it will not update.
   *
   * If switching to internal, the employee's role will be set to general staff.
   * If switching to external, the employee's role will be set to consultant.
   */
  async setEmployeeClassification(
    employeeUserId: number,
    newClassification: EmployeeClassification
  ): Promise<boolean> {
    const user = await this.getAccount(employeeUserId);
    if (!user) {
      console.error(
        "DatabaseManager",
        "Failed to get user for employeeUserId",
        employeeUserId
      );
      return false;
    }

    if (user.getEmployeeClassification() == newClassification) {
      console.warn(
        "DatabaseManager",
        "User already has the same classification",
        user.getEmployeeClassification()
      );
      return false;
    }

    if (newClassification == EmployeeClassification.Internal) {
      const updateUser = await db
        .update(usersTable)
        .set({
          employeeClassification: EmployeeClassification.Internal,
          employeeRole: EmployeeType.GeneralStaff,
        })
        .where(eq(usersTable.id, employeeUserId))
        .returning();
      if (updateUser.length === 0) {
        return false;
      }
    } else {
      const updateUser = await db
        .update(usersTable)
        .set({
          employeeClassification: EmployeeClassification.External,
        })
        .where(eq(usersTable.id, employeeUserId))
        .returning();
      if (updateUser.length === 0) {
        return false;
      }
      // call setEmployeeRole when switching to external to delete any data (line manager)
      const changeEmployeeRole = await this.setEmployeeRole(
        updateUser[0].id,
        EmployeeType.Consultant
      );
      if (!changeEmployeeRole) {
        return false;
      }
    }

    return true;
  }

  async setEmployeeRegion(
    employeeUserId: number,
    region: string
  ): Promise<boolean> {
    const updateUser = await db
      .update(usersTable)
      .set({
        region: region,
      })
      .where(eq(usersTable.id, employeeUserId))
      .returning();
    if (!updateUser) {
      return false;
    }
    return updateUser.length === 1;
  }

  async setEmployeeEmail(
    employeeUserId: number,
    email: string
  ): Promise<boolean> {
    const updateUser = await db
      .update(usersTable)
      .set({
        email: email,
      })
      .where(eq(usersTable.id, employeeUserId))
      .returning();
    if (!updateUser) {
      return false;
    }
    return updateUser.length === 1;
  }

  /**
   * Sets the employee role for the user.
   * If the user already has the same role, it will not update.
   *
   * This method will not switch the employee classification from internal to external, and will not switch
   * between internal and external roles. In this case, it will return false and you should call `setEmployeeClassification` first
   * before calling this method.
   */
  async setEmployeeRole(
    employeeUserId: number,
    newRole: EmployeeType
  ): Promise<boolean> {
    const user = await this.getAccount(employeeUserId);
    if (!user) {
      console.error(
        "DatabaseManager",
        "Failed to get user for employeeUserId",
        employeeUserId
      );
      return false;
    }

    if (user.getEmployeeRole().getType() === newRole) {
      console.warn(
        "DatabaseManager",
        "User already has the same role",
        user.getEmployeeRole().getType()
      );
      return false;
    }

    if (
      (user.getEmployeeClassification() == EmployeeClassification.Internal &&
        newRole == EmployeeType.Consultant) ||
      (user.getEmployeeClassification() == EmployeeClassification.External &&
        newRole != EmployeeType.Consultant)
    ) {
      console.error(
        "DatabaseManager",
        "Cannot switch employee classification from internal to external. Use setEmployeeClassification first"
      );
      return false;
    }

    if (user.getEmployeeRole().getType() == EmployeeType.LineManager) {
      console.log(
        "DatabaseManager",
        "Deleting line manager for user",
        employeeUserId
      );
      const deleteLineManager = await db
        .delete(lineManagersTable)
        .where(eq(lineManagersTable.lineManagerId, employeeUserId))
        .returning();
      console.log(
        "DatabaseManager",
        "deleteLineManager",
        deleteLineManager.length
      );
      const updateUsers = await db
        .update(usersTable)
        .set({
          lineManagerId: null,
        })
        .where(eq(usersTable.lineManagerId, employeeUserId))
        .returning();
      console.log("DatabaseManager", "updateUsers", updateUsers.length);
    }

    const updateUser = await db
      .update(usersTable)
      .set({
        employeeRole: newRole,
      })
      .where(eq(usersTable.id, employeeUserId))
      .returning();
    if (!updateUser) {
      return false;
    }

    return updateUser.length === 1;
  }

  // Claim table

  async addClaim(claim: Claim): Promise<Claim | null> {
    const insert = await db
      .insert(claimsTable)
      .values({
        employeeId: claim.getEmployeeId(),
        attemptCount: claim.getAttemptCount(),
        status:
          claim.getStatus() as (typeof claimsTable.$inferInsert)["status"],

        amount: claim.getAmount(),
        feedback: claim.getFeedback(),

        title: claim.getTitle(),
        description: claim.getDescription(),
        category: claim.getCategory(),
        currency: claim.getCurrency(),

        createdAt: claim.getCreatedAt(),
        lastUpdated: claim.getLastUpdated(),
      })
      .returning();
    if (insert.length !== 1) {
      return null;
    }
    return new Claim({
      id: insert[0].id,
      amount: insert[0].amount,
      employeeId: insert[0].employeeId,
      attemptCount: insert[0].attemptCount,
      status: insert[0].status as ClaimStatus,
      feedback: insert[0].feedback,
      evidence: [],

      accountName: insert[0].accountName,
      accountNumber: insert[0].accountNumber,
      sortCode: insert[0].sortCode,

      title: insert[0].title,
      description: insert[0].description,
      category: insert[0].category,
      currency: insert[0].currency,

      createdAt: insert[0].createdAt,
      lastUpdated: insert[0].lastUpdated,
    });
  }

  async getClaim(claimId: number): Promise<Claim | null> {
    const result = await db
      .select()
      .from(claimsTable)
      .where(eq(claimsTable.id, claimId));
    if (!result || result.length > 1) return null;

    return new Claim({
      id: result[0].id,
      employeeId: result[0].employeeId,

      amount: result[0].amount,
      attemptCount: result[0].attemptCount,
      status: result[0].status as ClaimStatus,
      feedback: result[0].feedback,
      evidence: this.getAllClaimEvidence(result[0].id),

      accountName: result[0].accountName,
      accountNumber: result[0].accountNumber,
      sortCode: result[0].sortCode,

      title: result[0].title,
      description: result[0].description,
      category: result[0].category,
      currency: result[0].currency,

      createdAt: result[0].createdAt,
      lastUpdated: result[0].lastUpdated,
    });
  }

  async getClaimsByManager(managerId: number): Promise<Claim[]> {
    const result = await db
      .select()
      .from(claimsTable)
      .innerJoin(
        lineManagersTable,
        eq(claimsTable.employeeId, lineManagersTable.employeeId)
      )
      .where(eq(lineManagersTable.lineManagerId, managerId));
    return result
      .map((row) => {
        const claim = row.claims_table;
        return new Claim({
          id: claim.id,
          employeeId: claim.employeeId,

          amount: claim.amount,
          attemptCount: claim.attemptCount,
          status: claim.status as ClaimStatus,
          feedback: claim.feedback,
          evidence: this.getAllClaimEvidence(claim.id),

          accountName: claim.accountName,
          accountNumber: claim.accountNumber,
          sortCode: claim.sortCode,

          title: claim.title,
          description: claim.description,
          category: claim.category,
          currency: claim.currency,

          createdAt: claim.createdAt,
          lastUpdated: claim.lastUpdated,
        });
      })
      .filter((claim) => claim.getStatus() == ClaimStatus.PENDING);
  }

  async getOwnClaimsByStatus(
    userId: number,
    status: ClaimStatus
  ): Promise<Claim[]> {
    const result = await db
      .select()
      .from(claimsTable)
      .where(
        and(eq(claimsTable.status, status), eq(claimsTable.employeeId, userId))
      );
    if (!result) return [];
    return result.map((row) => {
      return new Claim({
        id: row.id,
        employeeId: row.employeeId,

        amount: row.amount,
        attemptCount: row.attemptCount,
        status: row.status as ClaimStatus,
        feedback: row.feedback,
        evidence: this.getAllClaimEvidence(row.id),

        accountName: row.accountName,
        accountNumber: row.accountNumber,
        sortCode: row.sortCode,

        title: row.title,
        description: row.description,
        category: row.category,
        currency: row.currency,

        createdAt: row.createdAt,
        lastUpdated: row.lastUpdated,
      });
    });
  }

  async getAllReimbursedClaims(): Promise<Claim[]> {
    const result = await db
      .select()
      .from(claimsTable)
      .where(eq(claimsTable.status, "Reimbursed"));
    if (!result) return [];

    return result.map((row) => {
      return new Claim({
        id: row.id,
        employeeId: row.employeeId,

        amount: row.amount,
        attemptCount: row.attemptCount,
        status: row.status as ClaimStatus,
        feedback: row.feedback,
        evidence: this.getAllClaimEvidence(row.id),

        accountName: row.accountName,
        accountNumber: row.accountNumber,
        sortCode: row.sortCode,

        title: row.title,
        description: row.description,
        category: row.category,
        currency: row.currency,

        createdAt: row.createdAt,
        lastUpdated: row.lastUpdated,
      });
    });
  }

  async getAllAcceptedClaims(): Promise<Claim[]> {
    const result = await db
      .select()
      .from(claimsTable)
      .where(eq(claimsTable.status, "Accepted"));
    if (!result) return [];

    return result.map((row) => {
      return new Claim({
        id: row.id,
        employeeId: row.employeeId,

        amount: row.amount,
        attemptCount: row.attemptCount,
        status: row.status as ClaimStatus,
        feedback: row.feedback,
        evidence: this.getAllClaimEvidence(row.id),

        accountName: row.accountName,
        accountNumber: row.accountNumber,
        sortCode: row.sortCode,

        title: row.title,
        description: row.description,
        category: row.category,
        currency: row.currency,

        createdAt: row.createdAt,
        lastUpdated: row.lastUpdated,
      });
    });
  }

  async updateClaimBankDetails(
    claimId: number,
    newBankDetails: {
      accountName: string | undefined;
      accountNumber: string | undefined;
      sortCode: string | undefined;
    }
  ): Promise<boolean> {
    const result = await db
      .update(claimsTable)
      .set({
        accountName: newBankDetails.accountName,
        accountNumber: newBankDetails.accountNumber,
        sortCode: newBankDetails.sortCode,
      })
      .where(eq(claimsTable.id, claimId))
      .returning();
    if (!result) {
      return false;
    }
    const updateTime = await this.updateClaimLastUpdated(claimId);
    if (!updateTime) return false;
    return result.length === 1;
  }

  async updateClaimLastUpdated(claimId: number): Promise<boolean> {
    const result = await db
      .update(claimsTable)
      .set({
        lastUpdated: new Date(),
      })
      .where(eq(claimsTable.id, claimId))
      .returning();
    if (!result) {
      return false;
    }
    return result.length === 1;
  }

  async updateClaimFeedback(
    claimId: number,
    feedback: string
  ): Promise<boolean> {
    const result = await db
      .update(claimsTable)
      .set({
        feedback: feedback,
      })
      .where(eq(claimsTable.id, claimId))
      .returning();
    if (!result) {
      return false;
    }
    const updateTime = await this.updateClaimLastUpdated(claimId);
    if (!updateTime) return false;
    return result.length === 1;
  }

  async updateClaimAmount(claimId: number, amount: number): Promise<boolean> {
    const result = await db
      .update(claimsTable)
      .set({
        amount: amount,
      })
      .where(eq(claimsTable.id, claimId))
      .returning();
    if (!result) {
      return false;
    }
    const updateTime = await this.updateClaimLastUpdated(claimId);
    if (!updateTime) return false;
    return result.length === 1;
  }

  async updateClaimStatus(
    claimId: number,
    newClaimStatus: ClaimStatus
  ): Promise<boolean> {
    const result = await db
      .update(claimsTable)
      .set({
        status: newClaimStatus as (typeof claimsTable.$inferInsert)["status"],
      })
      .where(eq(claimsTable.id, claimId))
      .returning();

    if (!result) {
      return false;
    }
    const updateTime = await this.updateClaimLastUpdated(claimId);
    if (!updateTime) return false;
    return result.length === 1;
  }

  async updateClaimAttemptCount(
    claimId: number,
    newAttemptCount: number
  ): Promise<boolean> {
    const result = await db
      .update(claimsTable)
      .set({
        attemptCount: newAttemptCount,
      })
      .where(eq(claimsTable.id, claimId))
      .returning();

    if (!result) {
      return false;
    }
    const updateTime = await this.updateClaimLastUpdated(claimId);
    if (!updateTime) return false;
    return result.length === 1;
  }

  async updateClaimDetails(
    claimId: number,
    title: string,
    description: string,
    amount: number,
    category: string,
    currency: string
  ): Promise<boolean> {
    const result = await db
      .update(claimsTable)
      .set({
        title: title,
        description: description,
        amount: amount,
        category: category,
        currency: currency,
      })
      .where(eq(claimsTable.id, claimId))
      .returning();

    if (!result) {
      return false;
    }

    const updateTime = await this.updateClaimLastUpdated(claimId);
    if (!updateTime) return false;

    return result.length === 1;
  }

  /**
   * Gets list of evidence file names for a claim
   */
  getAllClaimEvidence(claimId: number): string[] {
    const claimPath = `${this.fileStoragePath}/${claimId}`;

    const claimPathExists = fs.existsSync(claimPath);
    if (!claimPathExists) {
      console.error(
        "DatabaseManager",
        "Get Claim Evidence - Claim path does not exist",
        claimPath
      );
      return [];
    }

    const files = fs.readdirSync(claimPath);
    const evidenceFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `${claimPath}/${file}`;
      const fileStat = fs.statSync(filePath);
      if (fileStat.isFile()) {
        evidenceFiles.push(file);
      }
    }
    console.log("DatabaseManager", "found evidence", claimId, evidenceFiles);
    return evidenceFiles;
  }

  getClaimEvidenceFile(claimId: number, evidenceName: string): File | null {
    const evidencePath = `${this.fileStoragePath}/${claimId}/${evidenceName}`;

    const evidencePathExists = fs.existsSync(evidencePath);
    if (!evidencePathExists) {
      console.error(
        "DatabaseManager",
        "Get Claim Evidence - Evidence path does not exist",
        evidencePath
      );
      return null;
    }

    const evidenceFile = fs.readFileSync(evidencePath);
    return new File([evidenceFile], evidenceName);
  }

  async addEvidence(claimId: number, file: File): Promise<boolean> {
    console.log("add evidence", claimId, file);
    const claimPath = `${this.fileStoragePath}/${claimId}`;
    const filePath = `${claimPath}/${file.name}`;

    const fileAlreadyExists = fs.existsSync(filePath);
    if (fileAlreadyExists) {
      console.error(
        "DatabaseManager",
        "Add Evidence - File already exists",
        filePath
      );
      return false;
    }

    const claimPathAlreadyExists = fs.existsSync(claimPath);
    console.log("claimPathAlreadyExists", claimPathAlreadyExists);
    if (!claimPathAlreadyExists) {
      console.log(
        "DatabaseManager",
        "Add Evidence - Claim path does not exist, create it",
        claimPath
      );
      fs.mkdirSync(claimPath, { recursive: true });
    }
    try {
      fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));
      const updateTime = await this.updateClaimLastUpdated(claimId);
      if (!updateTime) return false;
      return true;
    } catch (e) {
      console.error("DatabaseManager", "Add Evidence - Error writing file", e);
      return false;
    }
  }

  async removeEvidence(
    claimId: number,
    evidenceName: string
  ): Promise<boolean> {
    const claimPath = `${this.fileStoragePath}/${claimId}`;
    const filePath = `${claimPath}/${evidenceName}`;
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) {
      console.error(
        "DatabaseManager",
        "Remove Evidence - File does not exist",
        filePath
      );
      return false;
    }
    try {
      fs.unlinkSync(filePath);
      console.log(
        "DatabaseManager",
        "Remove Evidence - File removed",
        filePath
      );
      const updateTime = await this.updateClaimLastUpdated(claimId);
      if (!updateTime) return false;
      return true;
    } catch (e) {
      console.error(
        "DatabaseManager",
        "Remove Evidence - Error removing file",
        e
      );
      return false;
    }
  }


    /**
     * This function searches for subsections of the search string across the user database, and sorts them on length of match. 
     * 
     * EG: getUsersByName("smith") will return names:
     *  smith
     *  smeagol
     *  sarah
     * 
     * @param searchString search parameter names get compared against users first and family name
     * @returns An ordered array, lower index means User's name matches well with search parameter. 
     */
    async getUsersByName(searchString: string) : Promise<User[]> {
        const users = await this.getAllAccounts()

        // sort by rank from name 
        users.sort((a, b) => {
            return matchUserName(a, searchString) - matchUserName(b, searchString);
        })

        return users;
    }

    async getUsersByEmail(searchString: string)  : Promise<User[]> {
        const users = await this.getAllAccounts()

        // sort by rank from name 
        users.sort((a, b) => {
            return matchUserEmail(a, searchString) - matchUserEmail(b, searchString);
        })

        return users;
    }
  /**
   * Handles deleting a claim from the database.
   *
   * Throws 3 errors:
   * - Claim doesn't exist
   * - Claim ID not a Draft claim
   * - Unspecified error, delete failed
   *
   * @param userId User ID whose claim is being deleted.
   * @param claimId The specified claim to delete.
   */
  async deleteDraftClaim(userId: number, claimId: number) {
    // check if exists
    const claimRows = await this.getOwnClaimsByStatus(
      userId,
      ClaimStatus.DRAFT
    );

    if (!claimRows) {
      // throw Error doesn't exist
      throw new Error("Claim doesn't exist!");
    }
    // check if draft

    if (claimRows[0].getStatus() !== ClaimStatus.DRAFT) {
      // throw Error claimID specified not a draft
      throw new Error("Claim ID Specified is not a Draft claim!");
    }

    try {
      await db.delete(claimsTable).where(eq(claimsTable.id, claimId));
    } catch (error) {
      throw new Error("Unspecified error, delete failed. ");
    }
  }
}
