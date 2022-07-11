import React, { useEffect, useRef } from 'react';
import { LogBox } from 'react-native';
import Config from 'react-native-config';
import { initStripe } from '@stripe/stripe-react-native';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { MainProvider, RideStateContextContextProvider } from './context';
import MainRouter from './pages';
import RidePopups from './popups/RidePopups';
import { setTopLevelNavigator } from './services/navigation';
import NewRidePageContextProvider from './context/newRideContext';
import BottomSheetContextProvider from './context/bottomSheetContext';

LogBox.ignoreAllLogs();
const STRIPE_PUBLISHER_KEY = Config.STRIPE_PUBLISHER_KEY || '';

export default (props) => {
  const navigatorRef = useRef(null);

  useEffect(() => {
    initStripe({
      publishableKey: STRIPE_PUBLISHER_KEY,
      merchantIdentifier: 'merchant.identifier',
    });
  }, []);

  return (
    <NavigationContainer
      ref={navigatorRef}
      onReady={() => {
        if (navigatorRef) {
          setTopLevelNavigator(navigatorRef.current);
        }
      }}
    >
      <MainProvider {...props}>
        <BottomSheetContextProvider {...props}>
          <RideStateContextContextProvider {...props}>
            <NewRidePageContextProvider {...props}>
              <MainRouter {...props} />
              {props.children}
              <RidePopups />
            </NewRidePageContextProvider>
          </RideStateContextContextProvider>
        </BottomSheetContextProvider>
      </MainProvider>
    </NavigationContainer>
  );
};
