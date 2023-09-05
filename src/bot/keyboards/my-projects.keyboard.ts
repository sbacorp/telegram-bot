import { Menu } from "@grammyjs/menu";

export const toProjectsMenu = new Menu("to-projects").submenu(
  "Подробнее о проектах",
  "projects-menu"
);

export const projectsMenu = new Menu("projects-menu")
  .submenu("Платные образовательные продукты", "study-projects-menu")
  .row()
  .submenu("Мои БАДы", "buds-projects-menu")
  .row()
  .submenu(`Бесплатные образовательные продукты`, "free-projects-menu");

export const studyProjectsMenu = new Menu("study-projects-menu")
  .text(`Проект  "Детское здоровье"`, async (ctx) => {
    ctx.reply("Детское здоровье");
  })
  .row()
  .text(`Методичка по работе с желчью`, (ctx) => ctx.reply("You pressed B!"))
  .row()
  .text(`Онлайн-курс "Детская нутрициология"`, (ctx) =>
    ctx.reply("You pressed B!")
  )
  .row()
  .text(`Онлайн-курс "Семейная нутрициология"`, (ctx) =>
    ctx.reply("You pressed B!")
  )
  .row()
  .text(`Гайд "Аптечка для детей и взрослых"`, async (ctx) => {
    ctx.reply(`Гайд "Аптечка для детей и взрослых"`);
  })
  .row()
  .back("⬅️ Назад");

export const budsProjectsMenu = new Menu("buds-projects-menu")
  .text("Лецитин", (ctx) => ctx.reply("You pressed A!"))
  .row()
  .text("Магниевая вода", (ctx) => ctx.reply("You pressed B!"))
  .row()
  .back("⬅️ Назад");

export const freeProjectsMenu = new Menu("free-projects-menu")
  .text("A", (ctx) => ctx.reply("You pressed A!"))
  .row()
  .text("B", (ctx) => ctx.reply("You pressed B!"))
  .row()
  .back("⬅️ Назад");
