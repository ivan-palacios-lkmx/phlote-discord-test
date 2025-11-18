import { adminDb } from "@/lib/firebase-admin";
import { SettingsDoc } from "@/types/database";
import { GLOBAL_COLLECTION, SETTING_DOC_ID } from "@/utils/constants";
import { getIDAndDocumentDataFromDocumentSnapshot } from "@/utils/firebase-queries";

export class SettingsService {
  static async getSettings(): Promise<SettingsDoc | null> {
    const settingsSnapshot = await adminDb.collection(GLOBAL_COLLECTION).doc(SETTING_DOC_ID).get();
    return getIDAndDocumentDataFromDocumentSnapshot<SettingsDoc>(settingsSnapshot);
  }
}
