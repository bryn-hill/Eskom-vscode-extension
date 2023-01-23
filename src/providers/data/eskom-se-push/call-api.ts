import axios from 'axios';
import { ApiResponse, Slot } from '../../../data.type';
import { StageResponse } from './response.type';

export const callEskomSePushAPI = async (
  token: string,
  area: string
): Promise<ApiResponse | undefined> => {
  const apiConfig = {
    headers: {
      token,
    },
  };

  try {
    const response = await axios.get(
      `https://developer.sepush.co.za/business/2.0/area?id=${area}`,
      apiConfig
    );
    const responseData = response.data as StageResponse;
    const data = {
      slots: responseData.events.map(
        (item) =>
          ({ end: item.end, stage: item.note, start: item.start } as Slot)
      ),
    } as ApiResponse;

    return data;
  } catch (error) {
    console.error(error);
  }
};
