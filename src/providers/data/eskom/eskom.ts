import { ApiResponse } from '../../../data.type';
import { AbstractProviderClass } from '../provider';
import { areaSearch } from './area-search';
import { callEskomAPI } from './call-api';

export class EskomProvider extends AbstractProviderClass {
  areaSearch(): Promise<string | undefined> {
    return areaSearch();
  }
  callAPI(): Promise<ApiResponse | undefined> {
    return callEskomAPI();
  }
}
