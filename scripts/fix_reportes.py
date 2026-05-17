from pathlib import Path
path = Path(__file__).resolve().parents[1] / 'src' / 'app' / 'reportes.tsx'
text = path.read_text(encoding='utf-8')
needle = '    } catch (error) {\n      console.warn("No fue posible exportar CSV:", error);\n    }\n  };\n    const fileName = `tinkaventas-${filter.toLowerCase()}.csv`;\n'
if needle in text:
    text = text.replace(needle, '    } catch (error) {\n      console.warn("No fue posible exportar CSV:", error);\n    }\n  };\n')
    path.write_text(text, encoding='utf-8')
    print('removed duplicate block')
else:
    print('needle not found')
