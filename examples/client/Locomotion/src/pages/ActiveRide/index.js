import React, {
  useContext, useEffect, useRef, useState,
} from 'react';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { AppState, BackHandler } from 'react-native';
import { RIDE_STATES } from '../../lib/commonTypes';
import { RIDE_POPUPS } from '../../context/newRideContext/utils';
import { UserContext } from '../../context/user';
import {
  ConfirmPickup,
  NoPayment,
  NotAvailableHere,
  ConfirmingRide,
  NoAvailableVehicles,
  ActiveRide,
  LocationRequest,
  CancelRide,
} from '../../Components/BsPages';
import { RideStateContextContext, RideStateContextContextProvider } from '../../context';
import NewRidePageContextProvider, { RidePageContext } from '../../context/newRideContext';
import BottomSheetContextProvider, { BottomSheetContext, SNAP_POINT_STATES } from '../../context/bottomSheetContext';
import {
  PageContainer,
} from './styled';
import Header from '../../Components/Header';
import MainMap from './newMap';
import AvailabilityContextProvider from '../../context/availability';
import BottomSheet from '../../Components/BottomSheet';
import RideOptions from './RideDrawer/RideOptions';
import AddressSelector from './RideDrawer/AddressSelector';
import StopPointsViewer from '../../Components/StopPointsViewer';
import hamburgerIcon from '../../assets/hamburger.svg';
import backArrow from '../../assets/arrow-back.svg';
import { BS_PAGES } from '../../context/ridePageStateContext/utils';
import payments from '../../context/payments';
import geo, { DEFAULT_COORDS, getPosition } from '../../services/geo';
import RideCanceledPopup from '../../popups/RideCanceledPopup';
import SquareSvgButton from '../../Components/SquareSvgButton';
import targetIcon from '../../assets/target.svg';

const RidePage = ({ mapSettings, navigation }) => {
  const { locationGranted, setLocationGranted, user } = useContext(UserContext);
  const [addressSelectorFocus, setAddressSelectorFocus] = useState(null);
  const mapRef = useRef();
  const bottomSheetRef = useRef(null);
  const {
    currentBsPage, changeBsPage,
  } = useContext(RideStateContextContext);
  const {
    serviceEstimations,
    setServiceEstimations,
    initSps,
    requestStopPoints,
    requestRide,
    setChosenService,
    ride,
    setRidePopup,
    ridePopup,
    updateRequestSp,
    setRide,
    setRequestStopPoints,
  } = useContext(RidePageContext);
  const {
    setIsExpanded, snapPoints, isExpanded,
  } = useContext(BottomSheetContext);
  const {
    clientHasValidPaymentMethods,
  } = payments.useContainer();

  const resetStateToAddressSelector = (selected = null) => {
    setServiceEstimations(null);
    setChosenService(null);
    changeBsPage(BS_PAGES.ADDRESS_SELECTOR);
    setAddressSelectorFocus(selected);
  };

  const goBackToAddress = (selected) => {
    resetStateToAddressSelector(selected);
    setTimeout(() => {
      setIsExpanded(true);
    }, 100);
    bottomSheetRef.current.expand();
  };

  const backToMap = () => {
    resetStateToAddressSelector();
    initSps();
  };

  const BS_PAGE_TO_COMP = {
    [BS_PAGES.CANCEL_RIDE]: () => (
      <CancelRide />
    ),
    [BS_PAGES.SERVICE_ESTIMATIONS]: () => (
      <RideOptions />
    ),
    [BS_PAGES.LOCATION_REQUEST]: () => (
      <LocationRequest
        onSecondaryButtonPress={goBackToAddress}
      />
    ),
    [BS_PAGES.NOT_IN_TERRITORY]: () => (
      <NotAvailableHere
        fullWidthButtons
        onButtonPress={() => {
          resetStateToAddressSelector();
        }}
      />
    ),
    [BS_PAGES.ADDRESS_SELECTOR]: () => (
      <AddressSelector addressSelectorFocus={addressSelectorFocus} />
    ),
    [BS_PAGES.CONFIRM_PICKUP]: () => (
      <ConfirmPickup
        isConfirmPickup
        initialLocation={requestStopPoints[0]}
        onButtonPress={(pickupLocation) => {
          if (clientHasValidPaymentMethods() || ride.paymentMethodId === 'cash') {
            requestRide(pickupLocation);
          } else {
            changeBsPage(BS_PAGES.NO_PAYMENT);
          }
        }}
      />
    ),
    [BS_PAGES.SET_LOCATION_ON_MAP]: () => (
      <ConfirmPickup onButtonPress={(sp) => {
        updateRequestSp(sp);
        changeBsPage(BS_PAGES.ADDRESS_SELECTOR);
        setIsExpanded(true);
      }}
      />
    ),
    [BS_PAGES.NO_PAYMENT]: () => <NoPayment />,
    [BS_PAGES.CONFIRMING_RIDE]: () => <ConfirmingRide />,
    [BS_PAGES.NO_AVAILABLE_VEHICLES]: () => (
      <NoAvailableVehicles
        onButtonPress={() => changeBsPage(BS_PAGES.SERVICE_ESTIMATIONS)}
      />
    ),
    [BS_PAGES.ACTIVE_RIDE]: () => <ActiveRide />,
  };

  const focusCurrentLocation = async () => {
    const location = await getPosition();
    const { coords } = (location || DEFAULT_COORDS);
    let { latitude } = coords;
    if (![BS_PAGES.CONFIRM_PICKUP, BS_PAGES.SET_LOCATION_ON_MAP].includes(currentBsPage)) {
      latitude -= parseFloat(snapPoints[0]) / 10000;
    }
    mapRef.current.animateToRegion({
      latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    }, 1000);
  };

  const checkLocationPermission = async () => {
    const granted = await geo.checkPermission();
    setLocationGranted(granted);
  };

  useEffect(() => {
    if (locationGranted && currentBsPage === BS_PAGES.LOCATION_REQUEST) {
      changeBsPage(BS_PAGES.ADDRESS_SELECTOR);
      bottomSheetRef.current.collapse();
    } else if (!locationGranted
      && locationGranted !== undefined
      && currentBsPage === BS_PAGES.ADDRESS_SELECTOR) {
      changeBsPage(BS_PAGES.LOCATION_REQUEST);
    }
    focusCurrentLocation();
  }, [locationGranted]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (serviceEstimations) {
          resetStateToAddressSelector();
          return true;
        }
        return false;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  useEffect(() => {
    checkLocationPermission();
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        nextAppState === 'active'
      ) {
        checkLocationPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      navigation.closeDrawer();
    }
  }, [isFocused]);

  const getRequestSpsFromRide = () => ride.stopPoints.map(sp => ({
    lat: sp.lat,
    lng: sp.lng,
    streetAddress: sp.description,
    description: sp.description,
    type: sp.type,
  }));

  useEffect(() => {
    if (bottomSheetRef && bottomSheetRef.current) {
      if (isExpanded) {
        bottomSheetRef.current.expand();
      } else {
        bottomSheetRef.current.collapse();
      }
    }
  }, [isExpanded]);

  return (
    <PageContainer>
      <MainMap
        ref={mapRef}
        mapSettings={mapSettings}
      />
      {!serviceEstimations
        ? (
          <Header
            icon={hamburgerIcon}
            onPressIcon={navigation.openDrawer}
          />
        )
        : (
          <Header
            icon={backArrow}
            onPressIcon={backToMap}
          >
            <StopPointsViewer goBackToAddressSelector={goBackToAddress} />
          </Header>
        )}
      {!isExpanded && locationGranted && (
        <SquareSvgButton
          onPress={focusCurrentLocation}
          icon={targetIcon}
          style={{ position: 'absolute', bottom: `${parseFloat(snapPoints[0]) + 2}%`, right: 20 }}
        />
      )}
      <BottomSheet
        ref={bottomSheetRef}
        focusCurrentLocation={focusCurrentLocation}
      >
        {
          BS_PAGE_TO_COMP[currentBsPage] ? BS_PAGE_TO_COMP[currentBsPage]() : null
        }
      </BottomSheet>
      <RideCanceledPopup
        isVisible={ridePopup === RIDE_POPUPS.RIDE_CANCELED_BY_DISPATCHER}
        onCancel={() => {
          backToMap();
          setRidePopup(null);
          setRide({});
        }}
        onSubmit={() => {
          changeBsPage(BS_PAGES.SERVICE_ESTIMATIONS);
          setRidePopup(null);
          const sps = getRequestSpsFromRide();
          setRequestStopPoints(sps);
          setRide({});
        }
        }
      />
    </PageContainer>
  );
};

export default props => (

  <AvailabilityContextProvider>
    <RidePage
      {...props}
    />
  </AvailabilityContextProvider>
);
