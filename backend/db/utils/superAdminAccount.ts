import { DatabaseManager } from "../databaseManager";
import { defaultPassword } from "./consts";

async function AddOrGetAdministrator() {
    const SUPER_ADMIN_EMAIL = "superAdmin@test.com";
    const SUPER_ADMIN_PASSWORD = defaultPassword;

    const dbManager = DatabaseManager.getInstance();

    const tryLogin = await dbManager.Login(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
    if (tryLogin) {
        console.log("Administrator Login test successful - already exists");
        console.log(`Created new admin account - user id: ${tryLogin.getId()} login email: ${tryLogin.getEmail()} password: ${"pass123"}`);
        return;
    }

    console.log("Super Admin account doesnt exist - creating one")

    const administrator = await dbManager.Register(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, true)

    if (!administrator) {
        throw new Error("Administrator Insert failed");
    }
    console.log("Administrator Insert successful");

    const tryLogin2 = await dbManager.Login(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
    if (!tryLogin2) {
        throw new Error("Administrator Login failed");
    }
    console.log("Administrator Login test successful");

    console.log(`Created new admin account - user id: ${administrator.getId()} login email: ${administrator.getEmail()} password: ${defaultPassword}`);
}

AddOrGetAdministrator();