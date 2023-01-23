import { Search } from 'eskom-loadshedding-api';

import * as vscode from 'vscode';

export const areaSearch = async () => {
  const area = await vscode.window.showInputBox({
    placeHolder: 'Enter Area Eg. Green Point',
  });
  if (!area) {
    return;
  }

  const results = await Search.searchSuburbs(area);
  if (results.length <= 1) {
    return JSON.stringify(results[0]);
  }
  const selectedItem = await vscode.window.showQuickPick(
    results
      .sort((a, b) => {
        if (a.province < b.province) {
          return -1;
        }
        if (a.province > b.province) {
          return 1;
        }
        if (a.suburb < b.suburb) {
          return -1;
        }
        if (a.suburb > b.suburb) {
          return 1;
        }
        return 0;
      })
      .map((item) => ({
        label: `${item.province} - ${item.suburb}`,
        details: JSON.stringify(item),
      }))
  );
  return selectedItem?.details;
};
