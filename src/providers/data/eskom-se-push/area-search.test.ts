import axios from 'axios';
import * as vscode from 'vscode';
import { areaSearch } from './area-search';

jest.mock('axios');
describe('areaSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return if no area is entered', async () => {
    (
      vscode.window.showInputBox as jest.MockedFunction<
        typeof vscode.window.showInputBox
      >
    ).mockReturnValueOnce(Promise.resolve(''));

    await areaSearch('token');

    expect(vscode.window.showInputBox).toHaveBeenCalled();
    expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
    expect(vscode.window.showErrorMessage).not.toHaveBeenCalled();
  });

  it('should return error message if API call fails', async () => {
    (
      vscode.window.showInputBox as jest.MockedFunction<
        typeof vscode.window.showInputBox
      >
    ).mockReturnValueOnce(Promise.resolve('Green Point'));
    (axios.get as jest.MockedFunction<typeof axios.get>).mockRejectedValueOnce(
      new Error('API Error')
    );

    await areaSearch('token');

    expect(vscode.window.showInputBox).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalled();
    expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      'Could not connect to EskomSePush API'
    );
  });

  it('should return selected item details if API call is successful', async () => {
    (
      vscode.window.showInputBox as jest.MockedFunction<
        typeof vscode.window.showInputBox
      >
    ).mockReturnValueOnce(Promise.resolve('Green Point'));
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce({
      data: {
        areas: [
          { region: 'Western Cape', name: 'Green Point', id: '123' },
          { region: 'Western Cape', name: 'Sea Point', id: '456' }
        ]
      }
    });
    (
      vscode.window.showQuickPick as jest.MockedFunction<
        typeof vscode.window.showQuickPick
      >
    ).mockReturnValueOnce(
      Promise.resolve({
        label: 'Western Cape - Green Point',
        details: '123'
      })
    );

    const result = await areaSearch('token');

    expect(vscode.window.showInputBox).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalled();
    expect(vscode.window.showQuickPick).toHaveBeenCalled();
    expect(vscode.window.showErrorMessage).not.toHaveBeenCalled();
    expect(result).toBe('123');
  });
});
