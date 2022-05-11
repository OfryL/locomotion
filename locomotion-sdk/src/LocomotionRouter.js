import React, { useEffect } from 'react';
import Config from 'react-native-config';
import { initStripe } from '@stripe/stripe-react-native';
import 'react-native-gesture-handler';
import { MainProvider } from './context/main';
import MainRouter from './pages';

import RidePopups from './popups/RidePopups';
import SettingsContext from './context/settings'
import PaymentsContext from './context/payments'



const STRIPE_PUBLISHER_KEY = Config.STRIPE_PUBLISHER_KEY || '';

export default props => {
  useEffect(() => {
    console.error('strupe api key', {STRIPE_PUBLISHER_KEY})
    initStripe({
      publishableKey: STRIPE_PUBLISHER_KEY,
      merchantIdentifier: 'merchant.identifier',
    });
  }, []);

 return  (
   <MainProvider {...props}>
    <SettingsContext.Provider>
      <PaymentsContext.Provider>
        <MainRouter
          {...props}
          />
        {props.children}
        {/*  Popups */}
        <RidePopups />
      </PaymentsContext.Provider>
    </SettingsContext.Provider>
  </MainProvider>
)};
