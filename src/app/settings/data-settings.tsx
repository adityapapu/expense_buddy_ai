"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertCircleIcon, DownloadIcon, Loader2Icon, UploadIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export function DataSettings() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [importProgress, setImportProgress] = useState(0)
  const [dataCollection, setDataCollection] = useState(true)
  const [anonymousUsage, setAnonymousUsage] = useState(true)

  const handleExport = () => {
    setIsExporting(true)
    setExportProgress(0)

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsExporting(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleImport = () => {
    setIsImporting(true)
    setImportProgress(0)

    // Simulate import progress
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsImporting(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>Manage your data and privacy settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Export & Import</h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4">
                <div>
                  <h4 className="font-medium">Export Your Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all your transaction data and settings in CSV or JSON format.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                    {isExporting ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Export Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {isExporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Exporting data...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} />
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4">
                <div>
                  <h4 className="font-medium">Import Data</h4>
                  <p className="text-sm text-muted-foreground">Import transaction data from CSV or JSON files.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleImport} disabled={isImporting}>
                    {isImporting ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        Import Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {isImporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importing data...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Privacy Settings</h3>
            <div className="space-y-4">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Data Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow us to collect data about how you use the application to improve our services.
                  </p>
                </div>
                <Switch checked={dataCollection} onCheckedChange={setDataCollection} />
              </div>
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Anonymous Usage Statistics</Label>
                  <p className="text-sm text-muted-foreground">
                    Share anonymous usage statistics to help us improve the application.
                  </p>
                </div>
                <Switch checked={anonymousUsage} onCheckedChange={setAnonymousUsage} />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Data Retention</h3>
            <Alert>
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Data Retention Policy</AlertTitle>
              <AlertDescription>
                We store your transaction data for as long as you maintain an account with us. You can delete your data
                at any time from the account settings.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <h4 className="font-medium">Delete All Data</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your data from our servers. This action cannot be undone.
                </p>
              </div>
              <Button variant="destructive">Delete All Data</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

