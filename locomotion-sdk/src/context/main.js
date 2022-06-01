import React, { useContext } from 'react';
import AppSettings from '../services/app-settings';
import I18n from '../I18n';
import OnboardingContext from './onboarding';
import SettingsContext from './settings';
import PaymentsContext from './payments';
import ThemeProvider from './theme';
import UserContextProvider from './user';
import { StateContext, StateProvider } from './state';




export const MainProvider = ({ children, LoginPage, i18n }) => {
  const initialState = null;
  if (i18n) {
    i18n.translations.map(async (lng) => {
      await I18n.addResourceBundle(lng.lang, 'translation', lng.translation, true, true);
    });

    if (i18n.default) {
      I18n.changeLanguage(i18n.default);
    }
  }

  const saveState = async (state) => {
    try {
      await AppSettings.update(state);
    } catch (e) {
      console.error('Got error while try to save state', e);
    }
  };

  const reducer = (state, action) => {
    if (action && action.type) {
      switch (action.type) {
        case 'saveState':
          const newState = {
            ...state,
            ...action.payload,
          };

          saveState(newState);
          return newState;

        case 'changeState':
          return {
            ...state,
            ...action.payload,
          };
      }
    }
    return state;
  };


  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <SettingsContext.Provider>
        <PaymentsContext.Provider>
          <ThemeProvider>
            <UserContextProvider>
              <OnboardingContext.Provider>
                {children}
              </OnboardingContext.Provider>
            </UserContextProvider>
          </ThemeProvider>
        </PaymentsContext.Provider>
      </SettingsContext.Provider>
    </StateProvider>
  );
};

const getPopupKey = key => `popup_${key}`;

export const getTogglePopupsState = () => {
  const [state, dispatch] = useContext(StateContext);

  return [id => state && (state[getPopupKey(id)] || false), (id, open) => dispatch({
    type: 'changeState',
    payload: {
      [getPopupKey('ridePopupsStatus')]: open,
      [getPopupKey(id)]: open,
    },
  })];
};

export default {
  MainProvider,
  getTogglePopupsState,
};
