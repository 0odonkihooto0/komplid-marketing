<#
    Бланки документов → public/shablony-files.

    Что делает:
      1. .doc  → .docx через Word COM, .xls → .xlsx через Excel COM.
         Старые форматы 2003 года на сайте раздавать не хочется: часть
         почтовых клиентов и просмотрщиков их уже не открывает.
      2. Переименовывает в латиницу. /api/template-download валидирует имя
         файла как ^[\w\-\.]+$, а \w в JS без флага u — это [A-Za-z0-9_]:
         кириллическое имя не прошло бы проверку и скачивание отдавало бы 400.
      3. Снимает метку «файл скачан из интернета» (Unblock-File) — иначе Word
         открывает документ в защищённом просмотре и конвертация падает.

    Метаданные документов чистит отдельный скрипт clean-doc-metadata.py:
    в исходниках прописаны чужие Author и Company (ispolnitelnaya.ru,
    ConsultantPlus), а раздавать их с komplid.ru нельзя.

    Прогон разовый, результат коммитится:
      powershell -ExecutionPolicy Bypass -File scripts/prepare-templates.ps1
#>

$ErrorActionPreference = 'Stop'

$Src = 'C:\Users\user\Downloads\Бланки документов'
$Out = Join-Path $PSScriptRoot '..\public\shablony-files'
$Out = (Resolve-Path $Out).Path

# Исходное имя → имя на сайте. Порядок тот же, что у категорий каталога.
$Map = [ordered]@{
    # Акты по приказу Минстроя № 344/пр от 16.05.2023
    'АОСР приказ 344.docx'                                                          = 'shablon-aosr-344pr.docx'
    'АОГРОКС приказ 344.docx'                                                       = 'shablon-aogroks-344pr.docx'
    'АРОOКС приказ 344.docx'                                                        = 'shablon-aroks-344pr.docx'
    'АООК приказ 344.docx'                                                          = 'shablon-aook-344pr.docx'
    # Формы Госкомстата № 100
    'КС2.XLS'                                                                       = 'shablon-ks2.xlsx'
    'КС3.XLS'                                                                       = 'shablon-ks3.xlsx'
    'кс6а.XLS'                                                                      = 'shablon-ks6a.xlsx'
    # Журналы
    'Журналы\Общий журнал работ приказ 1026пр.doc'                                  = 'shablon-ozr-1026pr.docx'
    'Журналы\Журнал бетонных работ (1).doc'                                         = 'zhurnal-betonnyh-rabot.docx'
    'Журналы\Журнал сварочных работ.doc'                                            = 'zhurnal-svarochnyh-rabot.docx'
    'Журналы\Журнал входного учета и контроля качества.doc'                         = 'zhurnal-vhodnogo-kontrolya.docx'
    'Журналы\Журнал по монтажу строительных конструкций.doc'                        = 'zhurnal-montazha-konstrukciy.docx'
    'Журналы\Журнал замоноличивания монтажных стыков и узлов.doc'                   = 'zhurnal-zamonolichivaniya-stykov.docx'
    'Журналы\Журнал выполнения монтажных соединений на болтах с контролируемым натяжением.doc' = 'zhurnal-boltovyh-soedineniy.docx'
    'Журналы\Журнал погружения (забивки) свай.doc'                                  = 'zhurnal-pogruzheniya-svay.docx'
    'Журналы\Журнал производства антикоррозионных работ.doc'                        = 'zhurnal-antikorrozionnyh-rabot.docx'
    'Журналы\Журнал антикоррозионной защиты сварных соединений.doc'                 = 'zhurnal-antikorrozionnoy-zashchity.docx'
    'Журналы\Журнал контрольной тарировки динамометрических ключей.doc'             = 'zhurnal-tarirovki-klyuchey.docx'
    # Приёмка конструкций и покрытий
    'Акт приемки кровли.docx'                                                       = 'akt-priemki-krovli.docx'
    'Акт приемки фасадов здания.doc'                                                = 'akt-priemki-fasadov.docx'
    'Акт приемки защитного покрытия.docx'                                           = 'akt-priemki-zashchitnogo-pokrytiya.docx'
    'Акт ВИК.docx'                                                                  = 'akt-vik.docx'
    # Свайные и земляные работы
    'Акт освидетельствования и приемки сваи.docx'                                   = 'akt-priemki-svai.docx'
    'Акт освидетельствования и приемки скважины сваи.docx'                          = 'akt-priemki-skvazhiny-svai.docx'
    'Акт испытания сваи динамической нагрузкой Форма35.docx'                        = 'akt-ispytaniya-svai.docx'
    'Акт осмотра открытых рвов и котлованов под фундаменты.docx'                    = 'akt-osmotra-kotlovanov.docx'
}

$wdFormatXMLDocument = 12   # .docx
$xlOpenXMLWorkbook   = 51   # .xlsx

$word = $null
$excel = $null

try {
    foreach ($entry in $Map.GetEnumerator()) {
        # Имена переменных не должны отличаться от $Src и $Out только регистром:
        # PowerShell регистр в именах не различает, и $src затирал бы $Src —
        # на втором файле путь склеивался из имени первого.
        $srcFile = Join-Path $Src $entry.Key
        $dstFile = Join-Path $Out $entry.Value

        if (-not (Test-Path -LiteralPath $srcFile)) { throw "нет исходника: $srcFile" }
        try { Unblock-File -LiteralPath $srcFile } catch {}

        $ext = [System.IO.Path]::GetExtension($srcFile).ToLowerInvariant()

        if ($ext -eq '.docx') {
            Copy-Item -LiteralPath $srcFile -Destination $dstFile -Force
        }
        elseif ($ext -eq '.doc') {
            if ($null -eq $word) {
                $word = New-Object -ComObject Word.Application
                $word.Visible = $false
                $word.DisplayAlerts = 0
            }
            $doc = $word.Documents.Open([string]$srcFile, $false, $true)  # ReadOnly
            # SaveAs2 со строкой, а не SaveAs с [ref]: Join-Path возвращает
            # psobject, и COM отказывался приводить его к Object.
            $doc.SaveAs2([string]$dstFile, $wdFormatXMLDocument)
            $doc.Close($false)
        }
        elseif ($ext -eq '.xls') {
            if ($null -eq $excel) {
                $excel = New-Object -ComObject Excel.Application
                $excel.Visible = $false
                $excel.DisplayAlerts = $false
            }
            $wb = $excel.Workbooks.Open([string]$srcFile, 0, $true)  # ReadOnly
            $wb.SaveAs([string]$dstFile, $xlOpenXMLWorkbook)
            $wb.Close($false)
        }
        else { throw "неизвестное расширение: $srcFile" }

        $kb = [math]::Round((Get-Item -LiteralPath $dstFile).Length / 1KB)
        Write-Output ("  {0,-46} {1,5} КБ" -f $entry.Value, $kb)
    }
}
finally {
    if ($null -ne $word)  { $word.Quit();  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    if ($null -ne $excel) { $excel.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($excel) }
}

Write-Output "`nГотово: $($Map.Count) файлов в public/shablony-files"
