import React, { useState } from "react";
import styled from "styled-components";
import TextInput from "../../../Components/TextInput";
import OnboardingNavButtons from "./OnboardingNavButtons";
import onboardingContext from '../../../context/onboarding'
import { ErrorText, PageContainer, SafeView } from "./styles";
import i18n from "../../../I18n";
import Header from "./Header";
import ScreenText from "./ScreenText";


const Name = () => {
    const {onboardingState, updateState, updateUserInfo, navigateBasedOnUser} = onboardingContext.useContainer()
    const [showErrorText, setShowErrorText] = useState(false)

    const inputChange = field => value => {
        setShowErrorText(false)
        updateUserInfo({[field]: value })
        updateState(field, value)
    }

    return (
        <SafeView>
            <Header title={i18n.t('onboarding.pages.name.title')} />
            <PageContainer>
                <ScreenText 
                    text={i18n.t('onboarding.pages.name.text')} 
                    subText={i18n.t('onboarding.pages.name.subText')} />
                <TextInput
                placeholder={i18n.t('onboarding.firstNamePlaceholder')}
                onChangeText={inputChange('firstName')}
                value={onboardingState.firstName}
                autoCapitalize="words"
                />
                <TextInput
                placeholder={i18n.t('onboarding.lastNamePlaceholder')}
                onChangeText={inputChange('lastName')}
                value={onboardingState.lastName}
                autoCapitalize="words"
                />
            {showErrorText && <ErrorText>{i18n.t('onboarding.fullNameError')}</ErrorText>}
            <OnboardingNavButtons 
                isInvalid={!onboardingState.firstName || !onboardingState.lastName}
                onFail={() => setShowErrorText(true)}
                onNext={() => navigateBasedOnUser(onboardingState)}
                /> 
            </PageContainer>
        </SafeView>
    )
}

export default Name;