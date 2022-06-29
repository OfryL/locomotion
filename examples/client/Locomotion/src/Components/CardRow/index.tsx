/* eslint-disable no-nested-ternary */
/* eslint-disable no-mixed-operators */
import React, { useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import moment from 'moment';
import styled from 'styled-components';
import { PaymentIcon } from 'react-native-payment-icons';
import i18n from '../../I18n';
import SvgIcon from '../SvgIcon';
import selected from '../../assets/selected-v.svg';
import { Start, StartCapital } from '../../lib/text-direction';
import cashIcon from '../../assets/cash.svg';

type ContainerProps = {
  children: React.ReactNode,
  selected: boolean,
};

const CASH_METHOD_ID = 'cash';

const Container = styled(View) < ContainerProps >`
  flex-direction: row;
  justify-content: flex-start;
  padding: 20px;
  background-color: ${(props: any) => (props.selected ? '#rgba(36, 170, 242, 0.2)' : '#fff')};
  min-height: 70px;
  width: 100%;
`;

const ImageContainer = styled(View)`
  justify-content: center;
  position: relative;
`;

const margin = `margin-${Start()}`;

const TextContainer = styled(View)`
  justify-content: center;
  ${margin}: 16px;
  width: 80%;
`;

const Type = styled(Text)`
  justify-content: flex-start;
  font-weight: 500;
`;

export const Description = styled(Text)`
  justify-content: flex-start;
  color: #333333;
  font-size: 11px;
`;

const Error = styled(Text)`
  justify-content: flex-start;
  color: #f35657;
  font-size: 11px;
`;

const PlusContainer = styled(View)`
  background-color: #000;
  width: 20px;
  height: 20px;
  border-radius: 15px;
`;

const PlusText = styled(Text)`
  color: #fff;
  text-align: center;
`;


const style = {
  marginTop: -10,
  [StartCapital()]: 28,
};

const CashSelected = (
  <SvgIcon
    style={{
      position: 'absolute',
      right: 0,
      bottom: 0,
    }}
    Svg={selected}
  />
);

const CreditCardSelected = (
  <SvgIcon
    style={{
      position: 'absolute',
      right: 0,
      bottom: 5,
    }}
    Svg={selected}
  />
);

function capitalizeFirstLetter(string: string) {
  return string?.charAt(0).toUpperCase() + string?.slice(1);
}

const isCashPaymentMethod = paymentMethod => paymentMethod.id === CASH_METHOD_ID;


export default (paymentMethod: any) => (
  <TouchableOpacity onPress={paymentMethod.onPress}>
    <Container selected={paymentMethod.selected}>
      <ImageContainer>
        {paymentMethod.addNew
          ? (
            <>
              <PlusContainer><PlusText>+</PlusText></PlusContainer>
            </>
          )
          : (
            <>
              {isCashPaymentMethod(paymentMethod) ? <SvgIcon Svg={cashIcon} width="40px" height="25px" /> : <PaymentIcon type={paymentMethod.brand} />}
              {paymentMethod.selected ? (isCashPaymentMethod(paymentMethod) ? CashSelected : CreditCardSelected) : null }
            </>
          )
        }

      </ImageContainer>
      <TextContainer>
        {paymentMethod.addNew
          ? (
            <>
              <Type>{i18n.t('payments.addNewCreditCard').toString()}</Type>
            </>
          )
          : (
            <>
              <Type>{capitalizeFirstLetter(paymentMethod.brand)}</Type>
              {paymentMethod.lastFour ? <Description>{`**** ${capitalizeFirstLetter(paymentMethod.lastFour)}`}</Description> : null}
              {!isCashPaymentMethod(paymentMethod) && (true || (paymentMethod && moment(paymentMethod.expiresAt).isBefore(moment()))) ? <Error>{i18n.t('payments.expired').toString()}</Error> : null}
              {!isCashPaymentMethod(paymentMethod) && (true || (paymentMethod && !isCashPaymentMethod(paymentMethod) && paymentMethod.hasOutstandingBalance)) ? <Error>{i18n.t('payments.hasOutstandingBalance').toString()}</Error> : null}
            </>
          )}
      </TextContainer>
    </Container>
  </TouchableOpacity>
);
