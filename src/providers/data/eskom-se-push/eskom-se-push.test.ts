import { Cache } from '../../../settings.enum';
import { callEskomSePushAPI } from './call-api';
import { EskomSePushProvider } from './eskom-se-push';

jest.mock('./call-api', () => ({
  callEskomSePushAPI: jest.fn()
}));

describe('cacheResponseCall', () => {
  let context: any;
  const mockedData = { slots: [] };

  beforeEach(() => {
    jest.clearAllMocks();
    context = {
      subscriptions: [],
      globalState: {
        get: jest.fn(),
        update: jest.fn()
      }
    };
  });

  it('should call the API and update global state if the cached data is not present or the area or timestamp is different', async () => {
    jest.useFakeTimers();
    const provider = new EskomSePushProvider(context);
    (
      callEskomSePushAPI as jest.MockedFunction<typeof callEskomSePushAPI>
    ).mockResolvedValue(mockedData);
    (
      context.globalState.get as jest.MockedFunction<
        typeof context.globalState.get
      >
    ).mockReturnValue(undefined);
    const token = 'abc123';
    const area = '123';

    await provider.cacheResponseCall(token, area);

    expect(callEskomSePushAPI).toHaveBeenCalledWith(token, area);
    expect(context.globalState.update).toHaveBeenCalledWith(Cache.schedule, {
      apiResponse: mockedData,
      timestamp: new Date(),
      area
    });
  });

  it('should not call the API and update global state if the cached data is present or the area is the same ', async () => {
    jest.useFakeTimers();
    const token = 'abc123';
    const area = '123';

    const provider = new EskomSePushProvider(context);
    (
      callEskomSePushAPI as jest.MockedFunction<typeof callEskomSePushAPI>
    ).mockResolvedValue(mockedData);
    (
      context.globalState.get as jest.MockedFunction<
        typeof context.globalState.get
      >
    ).mockReturnValue({
      apiResponse: mockedData,
      timestamp: new Date(),
      area
    });

    await provider.cacheResponseCall(token, area);

    expect(callEskomSePushAPI).toBeCalledTimes(0);
    expect(context.globalState.update).toBeCalledTimes(0);

    // Change Area and call API again
    (
      context.globalState.get as jest.MockedFunction<
        typeof context.globalState.get
      >
    ).mockReturnValue({
      apiResponse: mockedData,
      timestamp: new Date(),
      area: 'new area'
    });

    await provider.cacheResponseCall(token, area);

    expect(callEskomSePushAPI).toHaveBeenCalledWith(token, area);
    expect(context.globalState.update).toBeCalledTimes(1);
  });

  it('should not call the API and update global state if the data is less than an hour old', async () => {
    jest.useFakeTimers();
    const token = 'abc123';
    const area = '123';

    const provider = new EskomSePushProvider(context);
    (
      callEskomSePushAPI as jest.MockedFunction<typeof callEskomSePushAPI>
    ).mockResolvedValue(mockedData);
    (
      context.globalState.get as jest.MockedFunction<
        typeof context.globalState.get
      >
    ).mockReturnValue({
      apiResponse: mockedData,
      timestamp: new Date(),
      area
    });
    jest.advanceTimersByTime(1000 * 60 * 59);
    await provider.cacheResponseCall(token, area);

    expect(callEskomSePushAPI).toBeCalledTimes(0);
    expect(context.globalState.update).toBeCalledTimes(0);

    jest.advanceTimersByTime(1000 * 60 * 60);
    await provider.cacheResponseCall(token, area);

    expect(callEskomSePushAPI).toBeCalledTimes(1);
    expect(context.globalState.update).toBeCalledTimes(1);
  });
});
