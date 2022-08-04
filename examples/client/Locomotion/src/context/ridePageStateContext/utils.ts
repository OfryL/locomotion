export type BsPages = 'ADDRESS_SELECTOR' | 'SET_LOCATION_ON_MAP' | 'SERVICE_ESTIMATIONS' | 'GENERIC_ERROR' |
 'CONFIRM_PICKUP' | 'NO_PAYMENT' | 'NOT_IN_TERRITORY' | 'CONFIRMING_RIDE' | 'ACTIVE_RIDE' | 'LOADING' |
 'NO_AVAILABLE_VEHICLES' | 'CUSTOM_TIP' | 'LOCATION_REQUEST' | 'CANCEL_RIDE' | 'CONFIRM_PICKUP_TIME' | 'CONFIRM_FUTURE_RIDE';

interface BsPageObject {
    [key: string]: BsPages
}

export const BS_PAGES: BsPageObject = {
  ADDRESS_SELECTOR: 'ADDRESS_SELECTOR',
  SET_LOCATION_ON_MAP: 'SET_LOCATION_ON_MAP',
  CONFIRM_PICKUP: 'CONFIRM_PICKUP',
  NO_PAYMENT: 'NO_PAYMENT',
  SERVICE_ESTIMATIONS: 'SERVICE_ESTIMATIONS',
  NOT_IN_TERRITORY: 'NOT_IN_TERRITORY',
  CONFIRMING_RIDE: 'CONFIRMING_RIDE',
  ACTIVE_RIDE: 'ACTIVE_RIDE',
  NO_AVAILABLE_VEHICLES: 'NO_AVAILABLE_VEHICLES',
  CONFIRM_PICKUP_TIME: 'CONFIRM_PICKUP_TIME',
  CUSTOM_TIP: 'CUSTOM_TIP',
  LOCATION_REQUEST: 'LOCATION_REQUEST',
  CANCEL_RIDE: 'CANCEL_RIDE',
  CONFIRM_FUTURE_RIDE: 'CONFIRM_FUTURE_RIDE',
  GENERIC_ERROR: 'GENERIC_ERROR',
  LOADING: 'LOADING',
};
