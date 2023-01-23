import axios from 'axios';
import * as vscode from 'vscode';
export const getStage = async () => {
  const eskomRegex = /ESKOM STAGE (\d+) UNTIL (\d{2}:\d{2})/;
  const cityRegex = /CITY CUSTOMERS ON STAGE (\d+) UNTIL (\d{2}:\d{2})/;
  try {
    const response = await axios.get(
      'https://ewn.co.za/assets/loadShedding/api/status'
    );
    const data = response.data as string | undefined;
    if (!data) {
      return vscode.window.showErrorMessage('Could not retrieve status');
    }
    const matchEskom = data.match(eskomRegex);
    const matchCity = data.match(cityRegex);
    const eskomStage = matchEskom ? matchEskom[1] : 'Not Found';
    const cityStage = matchCity ? matchCity[1] : 'Not Found';
    const info = data.split(',')?.[1].trim();

    return { eskomStage, cityStage };
  } catch (error) {
    console.error(error);
  }
};
