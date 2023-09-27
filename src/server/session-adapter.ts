/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unicorn/no-static-only-class */

import { SessionModel } from "./models.js";

export default class SessionService {
  static async read(key: string) {
    const session = await SessionModel.findOne({
      attributes: ["value"],
      where: { key },
      raw: true,
    });

    return session ? JSON.parse(session.value) : undefined;
  }

  static async write(key: string, data: any) {
    const value = JSON.stringify(data);
    await SessionModel.upsert(
      { key, value },
      {
        fields: ["value"],
        returning: false,
        conflictFields: ["key"],
      }
    );
  }

  static async delete(key: string) {
    await SessionModel.destroy({ where: { key } });
  }
}
