import axios from 'axios';
import { callEskomSePushAPI } from './call-api';
import * as vscode from 'vscode';
jest.mock('axios');

describe('callEskomSePushAPI', () => {
  it('should make a GET request to the correct URL with the correct token and area', async () => {
    const mockData = {
      events: [
        {
          end: '2022-01-01T00:00:00Z',
          note: 'stage 1',
          start: '2021-12-31T00:00:00Z'
        },
        {
          end: '2022-01-02T00:00:00Z',
          note: 'stage 2',
          start: '2022-01-01T00:00:00Z'
        }
      ]
    };

    (axios.get as jest.Mocked<any>).mockResolvedValue({ data: mockData });

    const token = 'abc123';
    const area = '123';
    const expectedUrl = `https://developer.sepush.co.za/business/2.0/area?id=${area}`;
    const expectedConfig = { headers: { token } };

    await callEskomSePushAPI(token, area);

    expect(axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
  });

  it('should return the correct ApiResponse data when the API call is successful', async () => {
    const mockData = {
      events: [
        {
          end: '2022-01-01T00:00:00Z',
          note: 'stage 1',
          start: '2021-12-31T00:00:00Z'
        },
        {
          end: '2022-01-02T00:00:00Z',
          note: 'stage 2',
          start: '2022-01-01T00:00:00Z'
        }
      ]
    };

    (axios.get as jest.Mocked<any>).mockResolvedValue({ data: mockData });

    const token = 'abc123';
    const area = '123';

    const expectedResponse = {
      slots: [
        {
          end: '2022-01-01T00:00:00Z',
          stage: 'stage 1',
          start: '2021-12-31T00:00:00Z'
        },
        {
          end: '2022-01-02T00:00:00Z',
          stage: 'stage 2',
          start: '2022-01-01T00:00:00Z'
        }
      ]
    };

    const response = await callEskomSePushAPI(token, area);

    expect(response).toEqual(expectedResponse);
  });

  it('should show an error message when the API call fails', async () => {
    const mockError = new Error('Something went wrong');

    (axios.get as jest.Mocked<any>).mockRejectedValue(mockError);

    const token = 'abc123';
    const area = '123';

    const spy = jest.spyOn(vscode.window, 'showErrorMessage');

    await callEskomSePushAPI(token, area);

    expect(spy).toHaveBeenCalledWith('Something went wrong calling the API.');
  });
});
