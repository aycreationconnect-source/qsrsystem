Dim dbName
dbName = InputBox("Enter the unique Database Name for this cafe:" & vbCrLf & vbCrLf & "Examples: mocha_bliss, central_cafe, bistro_99" & vbCrLf & vbCrLf & "(Click OK to confirm, or Cancel to use the default from .env)", "QSR POS - Cafe Database Setup", "mocha_bliss")
WScript.Echo Trim(dbName)
