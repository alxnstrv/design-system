# Figma Component Catalog

Живая витрина всех компонентов из твоего Figma файла.  
Автообновляется каждую ночь через GitHub Actions → деплоится на GitHub Pages.

---

## Запуск за 5 минут

### 1. Получи Figma Personal Access Token

1. Figma → аватар → **Settings**
2. Раздел **Security** → **Personal access tokens**
3. Нажми **Generate new token**, скопируй

### 2. Найди File Key

Открой нужный файл в Figma.  
URL выглядит так:
```
https://www.figma.com/file/ABC123XYZ/My-Design-System
                           ^^^^^^^^^
                           это и есть FILE_KEY
```

### 3. Запусти локально (проверка)

```bash
# Клонируй или скачай этот репо
git clone https://github.com/YOUR_USERNAME/figma-catalog.git
cd figma-catalog

# Запусти скрипт
FIGMA_TOKEN=ваш_токен FIGMA_FILE_KEY=ваш_file_key node fetch.js

# Открой витрину
open index.html
```

### 4. Задеплой на GitHub Pages

1. Создай новый репо на GitHub
2. Запушь все файлы
3. Иди в **Settings → Secrets and variables → Actions**
4. Добавь два секрета:
   - `FIGMA_TOKEN` — твой токен из шага 1
   - `FIGMA_FILE_KEY` — file key из шага 2
5. Включи GitHub Pages: **Settings → Pages → Source: GitHub Actions**
6. Запусти workflow вручную: **Actions → Update Figma Component Catalog → Run workflow**

Готово! Витрина доступна по адресу:
```
https://YOUR_USERNAME.github.io/figma-catalog/
```

---

## Файлы

| Файл | Описание |
|------|----------|
| `fetch.js` | Тянет данные из Figma REST API, сохраняет в `data.json` |
| `index.html` | Витрина — поиск, фильтры, список компонентов |
| `data.json` | Кэш данных (генерируется автоматически) |
| `.github/workflows/update.yml` | Автообновление каждую ночь |

---

## Версионирование

Каждую ночь скрипт:
1. Тянет свежие данные из Figma
2. Сравнивает с предыдущим `data.json`
3. Если что-то изменилось — делает коммит с датой
4. Деплоит обновлённую витрину

Вся история изменений видна в `git log data.json`.

```bash
# Посмотреть что менялось
git log --oneline data.json

# Сравнить с версией 2 недели назад
git diff HEAD~14 data.json
```
