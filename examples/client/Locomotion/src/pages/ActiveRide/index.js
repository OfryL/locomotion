import React, { useContext, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ConfirmPickup, NoPayment, NotAvailableHere } from '../../Components/BsPages';
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


const RidePage = ({ mapSettings }) => {
  const navigation = useNavigation();
  const mapRef = useRef();
  const bottomSheetRef = useRef(null);
  const {
    initGeoService, currentBsPage, changeBsPage,
  } = useContext(RideStateContextContext);
  const {
    serviceEstimations,
    setServiceEstimations,
    initSps,
    isLoading,
    requestStopPoints,
    requestRide,
    setChosenService,
  } = useContext(RidePageContext);
  const { setSnapPointsState, setIsExpanded } = useContext(BottomSheetContext);
  const {
    clientHasValidPaymentMethods,
  } = payments.useContainer();

  const resetStateToAddressSelector = () => {
    setServiceEstimations(null);
    setChosenService(null);
    changeBsPage(BS_PAGES.ADDRESS_SELECTOR);
  };

  const goBackToAddress = () => {
    resetStateToAddressSelector();
    setIsExpanded(true);
    bottomSheetRef.current.expand();
  };

  const backToMap = () => {
    resetStateToAddressSelector();
    initSps();
  };

  const addressSelectorPage = () => {
    if (!isLoading && !serviceEstimations) {
      return (
        <AddressSelector />
      );
    }
    return <RideOptions />;
  };

  const BS_PAGE_TO_COMP = {
    [BS_PAGES.NOT_IN_TERRITORY]: () => (
      <NotAvailableHere onButtonPress={() => {
        goBackToAddress();
      }}
      />
    ),
    [BS_PAGES.ADDRESS_SELECTOR]: addressSelectorPage,
    [BS_PAGES.CONFIRM_PICKUP]: () => (
      <ConfirmPickup
        initialLocation={requestStopPoints[0]}
        onButtonPress={() => {
          if (clientHasValidPaymentMethods()) {
            requestRide();
          } else {
            changeBsPage(BS_PAGES.NO_PAYMENT);
          }
        }}
      />
    ),
    [BS_PAGES.SET_LOCATION_ON_MAP]: () => (
      <ConfirmPickup onButtonPress={() => {
        changeBsPage(BS_PAGES.ADDRESS_SELECTOR);
      }}
      />
    ),
    [BS_PAGES.NO_PAYMENT]: () => <NoPayment />,
  };

  useEffect(() => {
    initGeoService();
  }, []);

  useEffect(() => {
    if (isLoading) {
      setSnapPointsState(SNAP_POINT_STATES.SERVICE_ESTIMATIONS);
      bottomSheetRef.current.collapse();
    }
  }, [isLoading]);

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
      <BottomSheet
        ref={bottomSheetRef}
      >
        {
          BS_PAGE_TO_COMP[currentBsPage]()
        }
      </BottomSheet>
    </PageContainer>
  );
};

export default props => (
  <BottomSheetContextProvider {...props}>
    <RideStateContextContextProvider {...props}>
      <NewRidePageContextProvider {...props}>
        <AvailabilityContextProvider>
          <RidePage
            {...props}
          />
        </AvailabilityContextProvider>
      </NewRidePageContextProvider>
    </RideStateContextContextProvider>
  </BottomSheetContextProvider>
);
