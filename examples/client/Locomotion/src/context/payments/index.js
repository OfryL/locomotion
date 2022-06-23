import React, { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import network from '../../services/network';

const BASE_PATH = '/api/v1/me/costumers';

const usePayments = () => {
  const [customer, setCustomer] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const getCustomer = async () => {
    const { data: clientData } = await network.get(BASE_PATH);
    return clientData;
  };

  const loadCustomer = async () => {
    const customerData = await getCustomer();
    setCustomer(customerData);
    setPaymentMethods(customerData.paymentMethods);
    return customerData;
  };

  const getOrFetchCustomer = async () => {
    if (customer) {
      return customer;
    }

    return loadCustomer();
  };

  const setup = async () => {
    const { data: intent } = await network.post(`${BASE_PATH}/setup`);
    return intent;
  };


  const detachPaymentMethod = async (paymentMethodId) => {
    const { data: paymentMethodsData } = await network.post(`${BASE_PATH}/${paymentMethodId}/detach`);
    return paymentMethodsData;
  };

  const clientHasValidPaymentMethods = () => {
    return paymentMethods.length > 0 && paymentMethods.some(pm => !pm.isExpired);
  }

  const getClientDefaultMethod = () => {
    // temp
    return (paymentMethods || []).find(pm => pm.isDefault) || paymentMethods[0];
  }


  return {
    getCustomer,
    customer,
    loadCustomer,
    setup,
    paymentMethods,
    detachPaymentMethod,
    getOrFetchCustomer,
    clientHasValidPaymentMethods,
    getClientDefaultMethod,
  };
};

export default createContainer(usePayments);
