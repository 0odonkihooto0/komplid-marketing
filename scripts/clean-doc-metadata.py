# -*- coding: utf-8 -*-
"""
Чистка метаданных бланков перед раздачей с komplid.ru.

В исходниках прописаны чужие имена: Author «ispolnitelnaya.ru» и
«ConsultantPlus», Last saved by «sales» и «Prof-PetuhovaOV», Company
чужих организаций. Файл, скачанный с нашего сайта, не должен внутри
ссылаться на посторонний сервис — это и выглядит неопрятно, и вводит
в заблуждение о происхождении бланка.

Правим OOXML напрямую (docx и xlsx — это zip): docProps/core.xml
и docProps/app.xml. Через COM то же самое делается втрое дольше
и падает на приведении типов.

Прогон разовый, результат коммитится:
    python scripts/clean-doc-metadata.py
"""
import re
import shutil
import zipfile
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "shablony-files"

CREATOR = "Комплид"
DESCRIPTION = "Бланк с komplid.ru — komplid.ru/shablony"

# Что вычищаем: значение тега заменяется целиком, а не дополняется.
CORE_TAGS = {
    "dc:creator": CREATOR,
    "cp:lastModifiedBy": CREATOR,
    "dc:description": DESCRIPTION,
    "cp:keywords": "",
    "dc:subject": "",
    "cp:category": "",
}
APP_TAGS = {
    "Company": "Комплид",
    "Manager": "",
}


def patch(xml: str, tags: dict[str, str]) -> str:
    for tag, value in tags.items():
        # Тег с содержимым.
        xml, n = re.subn(
            rf"<{tag}(\s[^>]*)?>.*?</{tag}>",
            rf"<{tag}\1>{value}</{tag}>" if value else rf"<{tag}\1></{tag}>",
            xml,
            flags=re.DOTALL,
        )
        # Самозакрывающийся тег: <dc:creator/>.
        if not n:
            xml = re.sub(rf"<{tag}(\s[^>]*)?/>", rf"<{tag}\1>{value}</{tag}>", xml)
    return xml


def clean(path: Path) -> list[str]:
    """Перепаковывает архив с исправленными docProps. Возвращает найденные чужие имена."""
    found: list[str] = []
    tmp = path.with_suffix(path.suffix + ".tmp")

    with zipfile.ZipFile(path) as src:
        names = src.namelist()
        with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as dst:
            for item in src.infolist():
                data = src.read(item.filename)

                if item.filename in ("docProps/core.xml", "docProps/app.xml"):
                    xml = data.decode("utf-8")
                    for marker in ("ispolnitelnaya", "ConsultantPlus", "Prof-Petuhova", "pto-mobile", "sales"):
                        if marker.lower() in xml.lower():
                            found.append(marker)
                    tags = CORE_TAGS if item.filename.endswith("core.xml") else APP_TAGS
                    data = patch(xml, tags).encode("utf-8")

                # Сохраняем дату записи из исходника: перепаковка не должна
                # выглядеть как правка содержимого документа.
                dst.writestr(item, data)

            # Если core.xml в архиве не было — добавляем, иначе Word подставит
            # имя пользователя при первом сохранении.
            if "docProps/core.xml" not in names:
                dst.writestr(
                    "docProps/core.xml",
                    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
                    '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"'
                    ' xmlns:dc="http://purl.org/dc/elements/1.1/">'
                    f"<dc:creator>{CREATOR}</dc:creator>"
                    f"<cp:lastModifiedBy>{CREATOR}</cp:lastModifiedBy>"
                    f"<dc:description>{DESCRIPTION}</dc:description>"
                    "</cp:coreProperties>",
                )

    shutil.move(str(tmp), str(path))
    return found


def main() -> None:
    files = sorted(p for p in OUT.iterdir() if p.suffix in (".docx", ".xlsx"))
    if not files:
        raise SystemExit("в public/shablony-files нет файлов — сначала prepare-templates.ps1")

    dirty = 0
    for path in files:
        found = clean(path)
        mark = ", ".join(sorted(set(found))) if found else "—"
        if found:
            dirty += 1
        print(f"  {path.name:<46} было: {mark}")

    print(f"\nОбработано {len(files)} файлов, чужие метаданные вычищены в {dirty}")


if __name__ == "__main__":
    main()
