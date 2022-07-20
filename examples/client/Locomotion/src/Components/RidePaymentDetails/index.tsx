import React, { useContext, useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MAIN_ROUTES } from '../../pages/routes';
import { getFormattedPrice } from '../../context/newRideContext/utils';
import CardRow from '../CardRow';
import CardsTitle from '../CardsTitle';
import i18n from '../../I18n';
import { RidePageContext } from '../../context/newRideContext';
import {
  PaymentRow, RidePriceDetails, PriceText, ViewDetails, CardRowContainer,
} from './styled';

type Nav = {
  navigate: (value: string, object?: any) => void;
}

const RidePaymentDetails = ({ rideId, paymentMethod }) => {
  const navigation = useNavigation<Nav>();
  const [totalAmount, setTotalAmount] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const {
    getRidePriceCalculation,
  } = useContext(RidePageContext);
  const updatePriceCalculation = async () => {
    const calculation = await getRidePriceCalculation(rideId);
    setTotalAmount((calculation?.totalPrice || 0)
     + (calculation?.discount || 0)
     + (calculation?.additionalCharges.find(({ chargeFor }) => chargeFor === 'tip')?.amount || 0));
    setCurrency(calculation?.currency || 'USD');
  };

  useEffect(() => {
    updatePriceCalculation();
  }, [rideId]);

  return (paymentMethod ? (
    <>
      <CardsTitle title={i18n.t('ride.paymentMethod')} />
      <PaymentRow>
        <CardRowContainer>
          <CardRow name={i18n.t('payments.cash')} {...paymentMethod} />
        </CardRowContainer>
        <RidePriceDetails>
          <PriceText>{getFormattedPrice(currency, totalAmount)}</PriceText>
          <TouchableOpacity onPress={() => navigation.navigate(MAIN_ROUTES.RIDE_PRICE_BREAKDOWN,
            { rideId })}
          >
            <ViewDetails>
              {i18n.t('ride.viewDetails').toString()}
            </ViewDetails>
          </TouchableOpacity>
        </RidePriceDetails>
      </PaymentRow>
    </>
  ) : null
  );
};


export default RidePaymentDetails;
