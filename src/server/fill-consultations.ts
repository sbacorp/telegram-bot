/* eslint-disable no-await-in-loop */
import { ConsultationModel } from "./models.js";

export async function fillConsultations() {
  const now = new Date();
  const endDate = new Date(
    now.getFullYear() + 1,
    now.getMonth(),
    now.getDate()
  );

  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  while (date < endDate) {
    const dateString = date.toISOString().slice(0, 10).replaceAll("-", "");
    if (date.getDay() === 3) {
      await ConsultationModel.create({
        date: dateString,
        time14: true,
        time15: true,
      });
    } else if (date.getDay() === 5 || date.getDay() === 6) {
      await ConsultationModel.create({
        date: dateString,
        time14: true,
      });
    }
    date.setDate(date.getDate() + 1);
  }
}
