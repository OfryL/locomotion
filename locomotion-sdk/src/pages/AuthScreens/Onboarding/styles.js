import styled from 'styled-components';
import { ERROR_COLOR, OPERATION_COLOR } from '../../../services/sharedStyles';

export const ErrorText = styled.Text`
  color: ${ERROR_COLOR};
  font-size: 12px;
  margin-top: 15px;
  width: 80%;
  text-align: center;
  align-self: center;
`;

export const SafeView = styled.SafeAreaView`
flex: 1;
background-color: white;
`;

export const PageContainer = styled.View`
flex: 1;
padding: 30px;
`;

export const ResendContainer = styled.Text`
width: 100%;
text-align: center;
margin-top: 50px;
opacity: .7;
`;

export const ResendText = styled.Text`
color: #707070;
`;

export const ResendButton = styled.Text`
text-decoration: underline;
text-decoration-color: ${OPERATION_COLOR};
color: ${OPERATION_COLOR};
`;

export const ImageContainer = styled.View`
display: flex;
flex-direction: row;
justify-content: flex-start;
align-items: center;
`;
export const Name = styled.Text`
font-size: 20px;
margin: 20px;
font-weight: 600;
`;
