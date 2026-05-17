from pathlib import Path
path = Path(__file__).resolve().parents[1] / 'src' / 'app' / 'reportes.tsx'
text = path.read_text(encoding='utf-8')
needle = '''  };
    const csv = `\ufeff${header}${body}`;

    try {
      if (Platform.OS === "web") {
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("No sharing available on this device");
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: `Exportar ${fileName}`,
        UTI: "public.comma-separated-values-text",
      });
    } catch (error) {
      console.warn("No fue posible exportar CSV:", error);
    }
'''
if needle in text:
    text = text.replace(needle, '  };
  return (\n')
    path.write_text(text, encoding='utf-8')
    print('duplicate chunk removed')
else:
    print('needle not found')
