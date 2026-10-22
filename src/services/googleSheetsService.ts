/**
 * Google Sheets Integration Service
 * Uses Google Sheets v4 REST API when authenticated with OAuth token,
 * and provides direct Google Sheets CSV/TSV web export.
 */

export interface CodingLogEntry {
  timestamp: string;
  roomCode: string;
  roomName: string;
  problemTitle: string;
  difficulty: string;
  category: string;
  language: string;
  testCasesPassed: string;
  participants: string;
  solutionNotes: string;
}

export const googleSheetsService = {
  /**
   * Generates a downloadable CSV string formatted for Google Sheets import
   */
  generateCsv(entries: CodingLogEntry[]): string {
    const headers = [
      'Timestamp',
      'Room Code',
      'Room Name',
      'Problem Title',
      'Difficulty',
      'Category',
      'Language',
      'Test Cases Passed',
      'Participants',
      'Solution Notes',
    ];

    const rows = entries.map((e) => [
      `"${e.timestamp}"`,
      `"${e.roomCode}"`,
      `"${e.roomName.replace(/"/g, '""')}"`,
      `"${e.problemTitle.replace(/"/g, '""')}"`,
      `"${e.difficulty}"`,
      `"${e.category}"`,
      `"${e.language}"`,
      `"${e.testCasesPassed}"`,
      `"${e.participants.replace(/"/g, '""')}"`,
      `"${e.solutionNotes.replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  /**
   * Downloads CSV file directly for Google Sheets upload
   */
  downloadCsv(entries: CodingLogEntry[], filename = 'CodeTogether_Practice_Log.csv') {
    const csvContent = this.generateCsv(entries);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Direct API call to Google Sheets if access token is available
   */
  async exportToGoogleSheetsApi(
    accessToken: string,
    sheetTitle: string,
    entries: CodingLogEntry[]
  ): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    // 1. Create a new Google Spreadsheet
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: sheetTitle || `CodeTogether Practice Log (${new Date().toLocaleDateString()})`,
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err?.error?.message || 'Failed to create Google Spreadsheet');
    }

    const sheetData = await createRes.json();
    const spreadsheetId = sheetData.spreadsheetId;
    const spreadsheetUrl = sheetData.spreadsheetUrl;

    // 2. Prepare headers and values
    const headers = [
      'Date & Time',
      'Room Code',
      'Room Name',
      'Problem Title',
      'Difficulty',
      'Category',
      'Language',
      'Test Cases Passed',
      'Collaborators',
      'Approach Notes',
    ];

    const values = [
      headers,
      ...entries.map((e) => [
        e.timestamp,
        e.roomCode,
        e.roomName,
        e.problemTitle,
        e.difficulty,
        e.category,
        e.language,
        e.testCasesPassed,
        e.participants,
        e.solutionNotes,
      ]),
    ];

    // 3. Append rows
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    );

    if (!appendRes.ok) {
      const appendErr = await appendRes.json();
      throw new Error(appendErr?.error?.message || 'Failed to append rows to Google Spreadsheet');
    }

    return { spreadsheetId, spreadsheetUrl };
  },
};
