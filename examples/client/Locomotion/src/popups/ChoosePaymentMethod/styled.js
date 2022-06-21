import React from 'react';
import styled from 'styled-components';
import { TextArea } from '../../Components/TextArea';

export const SummaryContainer = styled.View`
  flex: 1;
  flexShrink: 1;
  padding: 20px 0;
  background-color: white;
  justify-content: center;
  align-items: center;
  border-radius: 2px;
  border-color: rgba(0, 0, 0, 0.1);
`;

export const Title = styled.Text`
  margin: 0px 20px;
  font-size: 20px;
  color: black;
  font-weight: 500;
  margin-bottom: 15px;
`;

export const StyledTextArea = styled(TextArea)`
  margin-bottom: 20px;
`;
