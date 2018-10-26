import React from 'react';
import { translate } from 'react-i18next';
import { Tab, Button, Modal } from 'semantic-ui-react';
import OwlCarousel from 'react-owl-carousel2';
import { auth } from '../../../services/auth';
import client from '../../../services/apollo';
import savePrescriptionMutation from '../../../gql/mutations/savePrescription.gql';
import * as commonFunctions from '../../../utilities/commonFunctions';
import PrescriptionInfoPopup from '../../../components/prescriptionInfoPopup/PrescriptionInfoPopup';
import SimpleInfoPopup from '../../../components/simpleInfoPopup/SimpleInfoPopup';
import ErxModalPopup from '../../../components/erxModalPopup/ErxModalPopup';
import ConfirmPrescriptionModal from '../../../components/confirmPrescriptionModal/ConfirmPrescriptionModal';
import { isInfoShowOnInit } from '../../../constants/common';
import moment from 'moment';
import $ from 'jquery';
import _ from 'lodash';
import AddLocation from '../settings/addLocation'

var stats = {};
class PharmacySearch extends React.Component {

  constructor(props) {
    super(props);    
    let currentUser = this.getCurrentUserDetails();
      this.state = {
        modalHeadingText: '', modalData: [],
        showOpenPharmacies: true,
        basketPrescriptions: null, currentUser: currentUser, pharmacySearchResult: null, pharmacyList: null, listToFilter: null,
        activeLocation: "", prescriptionLoc: null,
        searchPrescriptionId: null,
        pharmascySuccess: false, showPrice: false, erxModalOpen: false, erxModalclose: false, loading: false,
        open: false, isMailingAddress: false, isSplitPharmacy: false, savingAmount: 0, activeKey: 0,
        locationOptions: [],
        addLocationOpen: false,
        currentEditPrescription: null,
        showEditPopup: false,
        isInit: true,
        isDoneInit: true,
        currentEditDrugs: null,
        totalItems: 0,
        priceLabel: 'Aetna Retail Price',
        searchText: '',
        sortOptions: [
          {
            text: 'Select',
            value: 'Select',
          },
          {
            text: props.t('Distance'),
            value: 'drug_distance',
          },
          {
            text: props.t('Time'),
            value: 'drug_duration',
          },
          {
            text: props.t('Cost'),
            value: 'drug_out_of_pocket',
          },
          {
            text: props.t('Rewards'),
            value: 'drug_reward',
          },
          {
            text: props.t('Aetna Price'),
            value: 'pbm_price',
          }
        ],
        selectedSort: 'Select',
        nextLoading: false,
        restrict: false,
        quantityRestrictionMessage: '',
        mostValue: null,
        closestValue: null,
        showBy: '',
        isOpenPharmacyFilterModal: false,
        checkedFilterToggle: '',        
      };

      this.toggleShowPrice = this.toggleShowPrice.bind(this);    
  }
  
  /* Retrieving Pharmacy Locations */
  componentDidMount() {  
    const { t } = this.props;  
    // INFORMATION POPUP
    isInfoShowOnInit && this.openInfoPopup();
    this.setState({
      modalHeadingText: t('Instructions'),
      modalData: [{
        title: t('searchPharmacy.modal.title1'),
        description: t('Select the pharmacy where you want to fill your prescription')
      },
      {
        title: t('What is "Out of Pocket"'),
        description: t('This is the amount you will be charged to fill the prescription at each location This amount includes your copay')
      },
      {
        title: t('What is "Reward"'),
        description: t('This is your portion of the savings for choosing lower cost options')
      }]
    })
    this.onDoneClick();
  }

  onPrescriptionOverlayClick() {
    if ($('body').hasClass('activeOverlay')) {
      $('body').removeClass('activeOverlay');
      this.setState({ showEditPopup: false });
      this.props.onModalClose();
    }
    if ($('.pres-details-popup').hasClass('open-popup')) {
      $('.pres-details-popup').removeClass('open-popup');
      $('body').removeClass('activeOverlay');
    }
    if ($('.form-popup').hasClass('open-popup')) {
      $('.form-popup').removeClass('open-popup');
      $('.pres-details-popup').addClass('open-popup');
    }
    if ($('.quantity-popup').hasClass('open-popup')) {
      $('.quantity-popup').removeClass('open-popup');
      $('.pres-details-popup').addClass('open-popup');
    }
    if ($('.dosage-popup').hasClass('open-popup')) {
      $('.dosage-popup').removeClass('open-popup');
      $('.pres-details-popup').addClass('open-popup');
    }
    if ($('.location-popup').hasClass('open-popup')) {
      $('.location-popup').removeClass('open-popup');
      $('body').removeClass('activeOverlay');
    }
  }

  // SEARCH PHARMACY INFO POPUP CLOSE
  close = () => {
    this.setState({ open: false })
  }

  // ADD MODAL CLOSE
  addLocationclose = () => {
    this.setState({ addLocationOpen: false })
  }

  // QUANTITY RESTRICTION POPUP CLOSE
  restrictClose = () => {
    this.setState({ restrict: false })
    if (this.props.isFromInPharmacy) {
      this.props.setIsFromInPharmacy(false, []);
    }
  }

  // SEARCH PHARMACY INFO POPUP OPEN
  openInfoPopup() {
    let visitedArray = localStorage.getItem('visited') ? JSON.parse(localStorage.getItem('visited')) : [];
    if (!visitedArray.includes('searchPharmacy')) {
      this.setState({ open: true });
    }
  }
    
  getBasketPrescriptions() {
    let basketPrescriptions = null;    
    if (this.props.isFromInPharmacy) {
      basketPrescriptions = [this.props.selectedWaitingPrescription];
    }
    else if (this.props.basket && this.props.basket.length > 0) {
      let foundPrescriptionItem = null;
      if (!this.props.savedPrescriptions || this.props.savedPrescriptions.length == 0) {
      }
      else {
        for (var index = 0; index < this.props.basket.length; index++) {
          if (this.props.isFromCart) {
            foundPrescriptionItem = this.props.savedPrescriptions
              .filter(prescription => prescription.prescription_id === this.props.cartPrescriptions[index])[0];
          } else {

            foundPrescriptionItem = this.props.savedPrescriptions
              .filter(prescription => prescription.prescription_id === this.props.basket[index])[0];
          }
          if (foundPrescriptionItem) {
            if (basketPrescriptions)
              basketPrescriptions.push(foundPrescriptionItem)
            else
              basketPrescriptions = [foundPrescriptionItem];
          } else {
          }
        }
      }
    } else if (this.props.temporaryPrescriptions) {
      basketPrescriptions = this.props.temporaryPrescriptions;
    }
    return basketPrescriptions;
  }

  /* Getting Details of the Logged In user along with Locations */
  getCurrentUserDetails() {
    let userInfo = auth.getUserInfo();
    let userDetails = null;
    let currentUserDetails = { email: null, };
    if (userInfo.employee) {
      userDetails = auth.getUserInfo().employee;
      currentUserDetails.email = userInfo.username;
      currentUserDetails.domain = userInfo.employee.domain;
      currentUserDetails.personal_email = userInfo.employee.personal_email;
      currentUserDetails.personal_phone = userInfo.employee.personal_phone;
      currentUserDetails.min_split_pharmacy_savings = userInfo.employee.domain.min_split_pharmacy_savings;
    }
    else {
      userDetails = userInfo.dependent;
      currentUserDetails.email = userDetails.email;
      currentUserDetails.domain = userDetails.domain;
      currentUserDetails.personal_email = userDetails.personal_email;
      currentUserDetails.personal_phone = userDetails.personal_phone;
      currentUserDetails.min_split_pharmacy_savings = userDetails.domain.min_split_pharmacy_savings;
    }
    let homeLocation = commonFunctions.setAddress(userDetails.home_address_1, userDetails.home_address_2, userDetails.city, userDetails.zip);
    let userLocations = [{ locationName: "Home", locationAddress: homeLocation, locationZipCode: userDetails.zip }];

    let storedLocations = userDetails.locations;
    for (var i = 0; i < storedLocations.length; i++)
      userLocations.push(
        {
          locationName: storedLocations[i].name,
          locationAddress: commonFunctions.setAddress(storedLocations[i].street_address, "", storedLocations[i].city, storedLocations[i].zip_code),
          locationZipCode: storedLocations[i].zip_code
        }
      );

    currentUserDetails =
      {
        ...currentUserDetails,
        claimed: userDetails.claimed,
        pbm_provider: userDetails.pbm_provider,
        pbm_price_display: userDetails.pbm_price_display,
        deductible_remaining: userDetails.deductible_remaining,
        contact_phone: userDetails.contact_phone,
        mailing_address: userDetails.mailing_address,
        payment_option: userDetails.payment_option,
        userLocations: userLocations,
      }
    return currentUserDetails;
  }

  // TO GET DRUG PRICES BY PHARMACIES
  getPharmacyDrugPrices(prescriptions, userLocation) {
    const { t } = this.props;
    let pharmacySearchResult = [];
    let currLoc = userLocation;
    for (var i = 0; i < prescriptions.length; i++) {
      let presc = prescriptions[i];
      let pharmacySearchAddress = currLoc.locationAddress;
      let pharmacySearchZipCode = currLoc.locationZipCode;
      let prescriptionPDA = presc.dpa ? presc.dpa : presc.lm_name;
      const variables = {
        term: presc.ddn_name,
        ndc: presc.lm_ndc,
        address: pharmacySearchAddress,
        pda: prescriptionPDA,
        gpi: presc.gpi,
        form: presc.form,
        package_size: presc.package_size,
        package_quantity: presc.package_quantity,
        zip_code: pharmacySearchZipCode,
        brand_generic: presc.brand_generic,
        days_of_supply: presc.daysofsupply,
        dosage_strength: presc.dosage_strength,
        flipt_person_id: presc.flipt_person_id,
        drug_name: presc.drug_name,
        package_qty: presc.package_qty,
        dosage: presc.dosage,
        gppc: presc.gppc,
        custom_quantity: presc.custom_quantity,
        specialty_flag: presc.specialty_flag
      };
      if (i < 10) {
        stats[`gpi${i + 1}`] = presc.gpi;
        stats[`drugname${i + 1}`] = presc.drug_name;
        stats[`form${i + 1}`] = presc.dosage;
        stats[`dosage_strength${i + 1}`] = presc.dosage_strength;
        stats[`daysofsupply${i + 1}`] = presc.daysofsupply;
        stats[`quantity${i + 1}`] = presc.package_quantity;
      }
      // GET DRUG PRICES GRAPHQL CALL
      Promise.all([
        this.props.getDrugPrices({ variables }),
      ]).then((response) => {
        let currentResponse = response[0];
        let currentPharmacyList = [];
        for (var k = 0; k < currentResponse.length; k++) {
          let pharmacy = currentResponse[k];
          pharmacy.specialty_flag = presc.specialty_flag;
          currentPharmacyList.push({ pharmacyLocation: currLoc.locationName, ...pharmacy });
        }
        pharmacySearchResult.push({ prescription_id: presc.prescription_id, currentPharmacyList: currentPharmacyList })
        let origBasketPresc = this.state.basketPrescriptions;
        if (prescriptions.length == pharmacySearchResult.length) {
          for (var j = 0; j < pharmacySearchResult.length; j++) {
            if (pharmacySearchResult[j].currentPharmacyList.length == 0) {
              let tempBasketPresc = this.state.basketPrescriptions;
              tempBasketPresc = tempBasketPresc.filter(psrItem => psrItem.prescription_id !== pharmacySearchResult[j].prescription_id);
              this.setState({ basketPrescriptions: tempBasketPresc });
            }
          }
          let finalResult = this.getFinalResult(pharmacySearchResult);
          if (finalResult) {
            let max;
            let results;
            let searchParamsToSave;
            var drug_baseline_price = 0;
            if (finalResult.length) {
              max = finalResult.length > 10 ? 10 : finalResult.length;
              results = this.props.searchResult;
              searchParamsToSave = this.props.searchParams;
            }
            for (let x = 0; x < max; x++) {
              const result = finalResult[x].pharmacyToReturn;
              drug_baseline_price = Math.ceil(result.drug_baseline_price);
              stats[`pharmacy_name${x + 1}`] = result.pharmacy_name;
              stats[`employee_opc${x + 1}`] = Math.ceil(result.drug_out_of_pocket);
              stats[`rewards${x + 1}`] = Math.ceil(result.drug_reward);
              stats[`drug_cost${x + 1}`] = Math.ceil(result.drug_price);
              stats[`pharmacy_address${x + 1}`] = result.pharmacy_address;
              stats[`copay_amount${x + 1}`] = Math.ceil(result.drug_copay);
              stats[`employer_cost${x + 1}`] = Math.ceil(result.drug_employer_cost);
              stats[`pbm_price${x + 1}`] = Math.ceil(result.pbm_price);
              stats[`pbm_estimated_cost${x + 1}`] = Math.ceil(result.pbm_estimated_cost);
              stats[`deductible_balance${x + 1}`] = Math.ceil(result.deductible_remaining);
            }
          }
          let userInfo = auth.getUserInfo();
          let userId = userInfo.user_id;
          stats['user_identification_id'] = userId;
          stats['drug_baseline_price'] = drug_baseline_price;
          if (finalResult.length == 0) this.setState({ basketPrescriptions: origBasketPresc });
          this.setState({ pharmacyList: finalResult, listToFilter: finalResult });
          let userInfoFromStore = JSON.parse(window.localStorage.getItem('userInfo'));
          let pbm_price_display = userInfoFromStore.employee ? userInfoFromStore.employee.domain.pbm_price_display : userInfoFromStore.dependent.domain.pbm_price_display;
          let pbm_provider = userInfoFromStore.employee ? userInfoFromStore.employee.domain.pbm_provider : userInfoFromStore.dependent.domain.pbm_provider;
          if (pbm_price_display == 'Y') {
            this.setState({
              priceLabel: pbm_provider ? pbm_provider + ' Price' : 'Est. Aetna Price'
            })
          } else {
            priceLabel: t('PBM Price')
          }
          
          if (finalResult.length > 0) {
            if (finalResult.find(item => item.pharmacyToReturn.drug_reward > 0)) { 
              this.setState({ showPrice: false }); 
            }
            else { 
              if (pbm_price_display == "Y")
                this.setState({ showPrice: true });
              else
                this.setState({ showPrice: false });
            }
          }
          
        }
      }).catch((err) => {
        let errorMsg = commonFunctions.parseGraphQLErrorMessage(err, this.props.t);
        this.setState({ showCommonErrorMessage: true, commonErrorMessage: errorMsg });
        this.setState({ pharmascySuccess: false });

      });
    }
  }

  onDoneClick() {
    this.setState({ pharmascySuccess: false });
    this.setState({ pharmacyList: null, listToFilter: null })
    let currentLocation = this.props.isFromInPharmacy
      ? this.state.currentUser.userLocations[0]
      : this.state.currentUser.userLocations.filter(psrItem => this.state.activeLocation == '' ? psrItem.locationName == "Home" : psrItem.locationName == this.state.activeLocation)[0];
    let currentPrescriptions = this.state.basketPrescriptions;
    if (this.state.basketPrescriptions && this.state.basketPrescriptions.length > 0) {
      this.getPharmacyDrugPrices(currentPrescriptions, currentLocation);
      setTimeout(() => {
        this.setState({ pharmascySuccess: true });
        Promise.all([
          this.props.savePrescriptionSearchDetail({ stats }),
        ]).then((response) => {
          this.setState({ searchPrescriptionId: response[0].id });
        })
      }, 10000);
    }
  }

  saveRxClick() {
    let tempPresc = JSON.stringify(this.props.temporaryPrescriptions);
    tempPresc = JSON.parse(tempPresc)[0];
    delete tempPresc["first_name"];
    delete tempPresc.last_name;
    commonFunctions.showPageLoader();
    // SAVE RX GRAPHQL CALL
    client.mutate({
      mutation: savePrescriptionMutation,
      variables: tempPresc
    }).then((response) => {
      commonFunctions.hidePageLoader();
      this.props.history.replace('/prescriptions');
    }).catch((err) => {
      commonFunctions.hidePageLoader()
    });
  }

  toggleShowPrice() {
    this.setState({ showPrice: this.state.showPrice ? false : true });
  }

  // BACK CLICK
  toggleSeachPharmacyView() {
    if (this.state.basketPrescriptions.length > 1) {
      this.props.history.replace('/search');
    } else {
      if (this.props.drugData) {
        this.props.setConfirmPrescription(true, this.state.basketPrescriptions[0]);
      }
    }
    this.props.setIsFromSeachPharmacy(false);
    this.props.setIsFromSearch(false);
    this.props.setIsFromCart(false, this.props.cartPrescriptions);
  }
  
  erxModalclose = () => {
    if (this.props.isFromInPharmacy) {
      this.props.setIsFromInPharmacy(false, []);
    }
    this.setState({ erxModalOpen: false })
  }

  // SETS CURRENT SELECTED PHARMACY
  openErx(pharmacyData, isMailingAddress = false, activeKey) {
    const { currentUser } = this.state;
    let bestPharmacyData = pharmacyData.bestPharmacyArray;
    let bestAmount = 0;
    let amount = 0;
    // FOR MULTIPHARMACY CHECKOUT
    bestPharmacyData.forEach(element => {
      bestAmount = bestAmount + parseFloat(element.drug_out_of_pocket);
    });
    bestAmount = Math.ceil(bestAmount);
    let currentPharmacyData = pharmacyData.currentPharmacy;
    currentPharmacyData.forEach(element => {
      amount = amount + parseFloat(element.drug_out_of_pocket);
    });
    amount = Math.ceil(amount);
    if (bestAmount < amount) {
      if ((amount - bestAmount) >= (currentUser.min_split_pharmacy_savings)) {
        this.setState({
          savingAmount: amount - bestAmount,
          isSplitPharmacy: true
        })
      }
    }
    this.setState({
      pharmacySelected: pharmacyData,
      isMailingAddress,
      activeKey,
      isInit: false
    })

    this.onNextClick();
  }

  renderLocationPopupOptions() {
    const { locationOptions, activeLocation } = this.state;
    var data = locationOptions.map((location, key) => {
      return (
        <div className={location.value == activeLocation ? "item active" : "item"} key={key}
          onClick={() => {
            this.setCurrentLocation(location);
          }}
        >
          <h5>{location.value}</h5>          
          <i><img src={require("../../../style/images/tick.svg")} /></i>
        </div>
      )
    })
    return data;
  }

  // TO RENDER PHARMACIES AS PER LOCATION SELECTION
  renderPharmacyListByLocation(pharmacyList, showOrder) {
    if (this.props.isFromInPharmacy) {
      pharmacyList = pharmacyList.filter(pharmacy =>
        pharmacy.pharmacyToReturn.pharmacy_name == this.props.selectedWaitingPrescription.preselected_pharmacy
      )
    }
    const { t } = this.props;        
    if (pharmacyList[0].pharmacyToReturn.deductible_remaining && pharmacyList[0].pharmacyToReturn.deductible_remaining == 0) {
      deductible_met = true;
    }

    var pharmaciesList = [];
    if (showOrder != '') {
      pharmaciesList = _.orderBy(
        pharmacyList,
        [pharmacy => (pharmacy.drug_out_of_pocket - pharmacy.drug_reward), 'drug_duration_value'],
        [showOrder, showOrder],
      );
    }
    else {
      pharmaciesList = pharmacyList;
    }

    return (
      pharmaciesList.length > 0 &&
      pharmaciesList
        .map((psrItemInfo, index) => {
          let isMailingAddress = !psrItemInfo.pharmacyToReturn.drug_duration
            || psrItemInfo.pharmacyToReturn.drug_duration == 'Mail Delivery'
            || psrItemInfo.pharmacyToReturn.drug_duration == 'Specialty Mail Order'
            ? true : false;
          let locationArr = psrItemInfo.pharmacyToReturn.pharmacy_address.split(', ');
          locationArr[locationArr.length - 1] = locationArr[locationArr.length - 1].substring(0, 5);
          let locationStr = locationArr.toString();
          let openNow;
          let localOpenHour = psrItemInfo.pharmacyToReturn.pharmacy_open_hour;
          let localCloseHour = psrItemInfo.pharmacyToReturn.pharmacy_close_hour;
          let isRewards = (psrItemInfo.pharmacyToReturn.drug_reward - psrItemInfo.pharmacyToReturn.drug_out_of_pocket) >= 0;
          let price = Math.abs(psrItemInfo.pharmacyToReturn.drug_reward - psrItemInfo.pharmacyToReturn.drug_out_of_pocket);

          if (this.state.mostValue == null || (this.state.mostValue < (psrItemInfo.pharmacyToReturn.drug_reward - psrItemInfo.pharmacyToReturn.drug_out_of_pocket))) {
            this.setState({
              mostValue: (psrItemInfo.pharmacyToReturn.drug_reward - psrItemInfo.pharmacyToReturn.drug_out_of_pocket)
            });
          }
          if (this.state.closestValue == null || (this.setState.closestValue > (psrItemInfo.pharmacyToReturn.drug_reward - psrItemInfo.pharmacyToReturn.drug_out_of_pocket))) {
            this.setState({
              closestValue: (psrItemInfo.pharmacyToReturn.drug_reward - psrItemInfo.pharmacyToReturn.drug_out_of_pocket)
            });
          }

          // TO CHECK PHARMACY IS OPEN OR NOT
          if (localOpenHour && localCloseHour) {
            localOpenHour = moment.utc(localOpenHour, 'HH:mm').local().format('HH:mm');
            localCloseHour = moment.utc(localCloseHour, 'HH:mm').local().format('HH:mm');
            if (moment(localCloseHour, 'HH:mm').isBefore(moment(localOpenHour, 'HH:mm'))) {
              openNow = moment().isBetween(moment(localOpenHour, 'HH:mm'), moment(localCloseHour, 'HH:mm').add(1, 'day'));
            } else {
              openNow = moment().isBetween(moment(localOpenHour, 'HH:mm'), moment(localCloseHour, 'HH:mm'));
            }
          }
          return (
            <div className="item pharmacy-item" key={index} onClick={() => { this.openErx(psrItemInfo, isMailingAddress, index) }} style={{ cursor: 'pointer' }}>
              <div className="ph-title">
                <h4>{psrItemInfo.pharmacyToReturn.pharmacy_name}                  
                </h4>
                <div className={isMailingAddress ? "ph-text mail-text" : "ph-text"}>
                  <i>
                    {isMailingAddress
                      ? <img src={require("../../../style/images/delivery-box.svg")} alt="delivery-box" />
                      : <a href={`https://www.google.com/maps/place/${locationStr.replace('/" "/g', "+")}`}
                        target='blank'
                        title="location"
                      >
                        <img src={require("../../../style/images/location-icon.svg")} alt="location-icon" />
                      </a>
                    }
                  </i>
                  <span className="text--light-grey">
                    {psrItemInfo.pharmacyToReturn.drug_distance}                    
                  </span>&nbsp;&nbsp;
                  {openNow !== undefined &&
                    <a className="show-more" style={{ color: openNow ? '#43bd8b' : '#F13838' }}>{openNow ? t('Open Now') : t('Closed')}</a>
                  }
                </div>
              </div>
              <div className="ph-money text-right">
                <span>{isRewards ? t('In Your Pocket') : t('Out of Pocket')}</span>
                <button className={isRewards ? "ui icon button shadow-btn btn-green" : "ui icon button shadow-btn red-btn"}>
                  {isRewards ? '+' : '-'} ${Math.round(price)}
                </button>
              </div>
            </div>
          )
        })
    )
  }

  renderHeaderSection() {
    const { t } = this.props;
    return (
      <div className="header-bottom-section">
        <div className="step-number">
          <h2>{t("Step 2")}: {t("Choose Pharmacy")}</h2>
        </div>
        <div className="ui progress">
          <div className="bar second-step">
            <div className="progress" />
          </div>
        </div>
      </div>
    )
  }

  onNextClick() {
    const { basketPrescriptions } = this.state;
    const { messages, i18n, isAdmin, userData, t } = this.props;
    if (!isAdmin && userData.domain.enable_quantity_resctriction == 'Y') {
      if (basketPrescriptions && basketPrescriptions.length == 1) {
        if (!this.props.isFromInPharmacy) {
          this.setState({ nextLoading: true });
        }
        commonFunctions.validateQuantity({
          drug_name: basketPrescriptions[0].drug_name,
          gpi: basketPrescriptions[0].gpi,
          flipt_person_id: basketPrescriptions[0].flipt_person_id
        }).then((res) => {
          this.setState({ erxModalOpen: true, nextLoading: false });
          commonFunctions.hidePageLoader()
        }).catch((error) => {
          commonFunctions.hidePageLoader()
          this.setState({ nextLoading: false });
          this.setState({ quantityRestrictionMessage: t('Quantity Restriction'), restrict: true })
        })
      } else {
        commonFunctions.hidePageLoader()
        this.setState({ erxModalOpen: true, nextLoading: false });
      }
    } else {
      commonFunctions.hidePageLoader()
      this.setState({ erxModalOpen: true, nextLoading: false });
    }
  }

  renderFooterSection() {
    const { nextLoading } = this.state;
    const { t } = this.props;
    return (
      <div className="bottom-fixed-section">
        <div className="ui container bottom-button clearfix">
          <button className="ui button btn btn-blue" title={t("Back")} onClick={() => { this.toggleSeachPharmacyView() }}>{t("Back")}</button>
          <Button className="ui button btn btn-blue-fill" title={t("Next")} loading={nextLoading} disabled={nextLoading} onClick={() => {
            this.onNextClick();
          }}>{t("Next")}</Button>
        </div>
      </div>
    )
  }

  handleOnLocationChange = (e, { name, value }) => {
    this.setState({
      showOpenPharmacies: true
    })
    this.setState({ [name]: value })    
  }

  setCurrentLocation = ({ value }) => {
    this.setState({
      showOpenPharmacies: true
    })
    this.setState({ activeLocation: value });
  }

  setCurrentEditPrescriptionData = (currentEditPrescription) => {    
    commonFunctions.showPageLoader();
    Promise.all([
      commonFunctions.getDrugDetails(commonFunctions.escapeString(currentEditPrescription.drug_name))
    ])
      .then((result) => {
        commonFunctions.hidePageLoader();
        let drugs = result[0].data.drugs;
        this.props.setCurrentEditPrescription(false, null)
        this.setState({
          currentEditPrescription: currentEditPrescription,
          currentEditDrugs: drugs,
          showEditPopup: true
        });
        $(document).ready(function () {
          $('body').addClass('activeOverlay');
          $('.pres-details-popup').addClass('open-popup');
        });
      })
      .catch((err) => {
        commonFunctions.hidePageLoader();
        this.setState({
          showEditPopup: false,
          currentDrugsForPrescription: null
        });
      });
  }

  // PRESCRIPTION CAROUSAL BELOW HEADER
  renderCarousal(basketPrescriptions, t) {
    const { totalItems, currentItem } = this.state;
    if (totalItems != basketPrescriptions.length && currentItem != 1) {
      this.setState({
        totalItems: basketPrescriptions.length,
        currentItem: 1
      })
    }
    const events = {
      onDragged: function (event) {
        let currentItem = event.item.index + 1;
        let totalItem = event.item.count;
        document.getElementById('carousalCount').innerHTML = currentItem + "/" + totalItem + " " + commonFunctions.initCap(t('PRESCRIPTION'))
      },
      onChanged: function (event) {
        let currentItem = event.item.index + 1;
        let totalItem = event.item.count;
        document.getElementById('carousalCount').innerHTML = currentItem + "/" + totalItem + " " + commonFunctions.initCap(t('PRESCRIPTION'))
      }
    };

    const owlSliderOptions = {
      navText: ['', ''],
      dots: true,
      dotsEach: true,
      responsiveClass: "true",
      responsive: {
        0: {
          items: 1,
          nav: true,
        },
        800: {
          items: 1,
          nav: true,
        },
        1300: {
          items: 1,
          nav: true,
        }
      }
    };
    {
      return (basketPrescriptions && basketPrescriptions.length > 0) &&
        <div className="search-bg">
          <div className="search-bg-data">
            <OwlCarousel ref="rxCards" options={owlSliderOptions} className="owl-carousel parmacylist-slider"
              events={events}
            >
              {
                basketPrescriptions.map((prescription, key) => {
                  return (
                    <div key={key}>
                      <div className="recent-info active recent-info-content">
                        <div className="clearfix recent-title">
                          <h5><em>{t('Drug')}</em> <span className="text-blue">{prescription.drug}</span></h5>
                          {(this.props.basket && this.props.basket.length <= 0) &&
                            <span className="recent-rcontent">
                              <i className="info-icon"><img src={require("../../../style/images/info-icon.svg")} /></i>
                              <button type="button" className="btn ui btn-red button" title={t("Save Rx")}
                                onClick={() => { this.saveRxClick() }}
                              >{t("Save Rx")}</button>
                            </span>
                          }
                        </div>
                        <div className="edit-info">
                          <ul>
                            <li><b>{t("User")} </b>{prescription.first_name} {prescription.last_name}</li>
                            <li><b>{t('Form')}: </b>{prescription.form}</li>
                            <li><b>{t('Dosage')}: </b>{prescription.dosage_strength}</li>
                          </ul>
                          <ul>
                            <li><b>{t('Days Supply')} : </b>{t('prescription.upToDaysLabel')} {prescription.daysofsupply}</li>
                            <li><b>{t('Location')} : </b>{prescription.locationSelected}</li>
                            <li><b>{t('Quantity')} : </b>{prescription.package_qty}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </OwlCarousel>
            <div id="carousalCount" className="text-center Circular_Std_Medium prescritionslide-text">{currentItem}/{totalItems} Prescription</div>
          </div>
        </div>
    }
  }

  // MY PRESCRIPTION LEFT SECTION
  renderMyPrescriptions(basketPrescriptions, t) {
    return (basketPrescriptions && basketPrescriptions.length > 0) &&
      basketPrescriptions.map((prescription, key) => {
        return (
          <div className="item" key={key}>
            <div className="item-details-content">
              <h4 className="text-left">{commonFunctions.initCap(prescription.drug)}</h4>
              <div className="item-info">
                {prescription.equivalent_brand ? prescription.equivalent_brand : <br />}
              </div>
              <div className="item-info">
                {prescription.package_qty}/ {prescription.dosage_strength}
              </div>
              <div className="item-img">
                <img className="ui image" src={require("../../../style/images/Long-Pills.png")} alt="Long-Pills" />
              </div>
              <div className="user-profile text-right">
                <a onClick={() => {
                  this.setCurrentEditPrescriptionData(prescription);
                }}
                  className="link-blue">Edit</a>
                <img src={require("../../../style/images/user-img.svg")} alt="user-img" className="ui fluid image" />
              </div>
            </div>
          </div>
        )
      })
  }

  // SEARCH INPUT FILTER CHANGE STATE
  handleChange = event => {
    const { listToFilter, searchText, isInit } = this.state;
    event.preventDefault();
    let valToSearch = event.target.value;
    let allPharmacies = JSON.stringify(listToFilter);
    allPharmacies = JSON.parse(allPharmacies);

    function filter_pharmacy(event) {
      return event.pharmacyToReturn.pharmacy_name.toLowerCase().includes(valToSearch.toLowerCase());
    }

    var filtered = allPharmacies.filter(filter_pharmacy);
    this.setState({
      [event.target.name]: event.target.value,
      pharmacyList: filtered,
      isInit: true
    })
  }

  // SHOW OPEN PHARMACIES SWITCH
  toggleShowOpenPharmacies = () => {
    const { listToFilter, selectedSort, pharmacyList, showOpenPharmacies } = this.state;
    let allPharmacies = JSON.stringify(!showOpenPharmacies ? listToFilter : pharmacyList)
    allPharmacies = JSON.parse(allPharmacies);
    if (this.state.showOpenPharmacies == true) {
      allPharmacies = allPharmacies.filter(pharmacy => {
        const { pharmacy_open_hour, pharmacy_close_hour } = pharmacy.pharmacyToReturn;
        let openNow = false;
        if (pharmacy_open_hour && pharmacy_close_hour) {
          const localOpenHour = moment.utc(pharmacy_open_hour, 'HH:mm').local().format('HH:mm');
          const localCloseHour = moment.utc(pharmacy_close_hour, 'HH:mm').local().format('HH:mm');
          if (moment(localCloseHour, 'HH:mm').isBefore(moment(localOpenHour, 'HH:mm'))) {
            openNow = moment().isBetween(moment(localOpenHour, 'HH:mm'), moment(localCloseHour, 'HH:mm').add(1, 'day'));
          } else {
            openNow = moment().isBetween(moment(localOpenHour, 'HH:mm'), moment(localCloseHour, 'HH:mm'));
          }
        }
        return openNow;
      });
    }

    var filter = selectedSort;
    let sortNeeded = this.isSortNeeded(allPharmacies, filter);

    // TO FILTER LIST AS PER SELECTED SORT ITEM
    if (filter != 'Select' && sortNeeded) {      
      if (filter == 'drug_reward') {
        allPharmacies = allPharmacies.sort((a, b) => parseFloat(b.pharmacyToReturn[filter]) - parseFloat(a.pharmacyToReturn[filter]));
      } else {        
        if (filter == 'drug_distance' || filter == 'drug_duration') {
          var arrayToConcat = [];
          for (var index = 0; index < allPharmacies.length; index++) {
            let isMailingAddress = !allPharmacies[index].pharmacyToReturn.drug_duration
              || allPharmacies[index].pharmacyToReturn.drug_duration == 'Mail Delivery'
              || allPharmacies[index].pharmacyToReturn.drug_duration == 'Specialty Mail Order'
              ? true : false;
            if (isMailingAddress) {
              var lastElement = allPharmacies[index];
              allPharmacies.splice(index, 1);
              arrayToConcat.push(lastElement);
            }
          }
        }
        allPharmacies = allPharmacies.sort((a, b) => parseFloat(a.pharmacyToReturn[filter]) - parseFloat(b.pharmacyToReturn[filter]));
        if (filter == 'drug_distance' || filter == 'drug_duration') {
          if (arrayToConcat.length > 0) {
            allPharmacies = allPharmacies.concat(arrayToConcat)
          }
        }
      }
    }

    this.setState({
      showOpenPharmacies: !this.state.showOpenPharmacies,
      pharmacyList: allPharmacies,
      isInit: true
    })
  }

  // TO CHECK IF SORT REQUIRES OR NOT
  isSortNeeded = (allPharmacies, filter) => {
    if (allPharmacies && allPharmacies.length > 0) {
      let firstPharmacy = parseFloat(allPharmacies[0].pharmacyToReturn[filter])
      for (var index = 0; index < allPharmacies.length; index++) {
        if (filter == 'drug_out_of_pocket' || filter == 'drug_reward' || filter == 'pbm_price') {
          if (firstPharmacy - parseFloat(allPharmacies[index].pharmacyToReturn[filter]) != 0) {
            return true;
          }
        } else {
          return true;
        }
      }
      return false;
    } else {
      return true;
    }
  }

  // ON SORT DROPDOWN CHANGE
  handleSort = (e, { name, value }) => {
    const { listToFilter, showOpenPharmacies, pharmacyList } = this.state;
    let allPharmacies = JSON.stringify(!showOpenPharmacies ? pharmacyList : listToFilter);
    allPharmacies = JSON.parse(allPharmacies);
    const filter = value;

    let sortNeeded = this.isSortNeeded(allPharmacies, filter);
    if (filter != 'Select' && sortNeeded) {
      if (filter == 'drug_reward') {
        allPharmacies = allPharmacies.sort((a, b) => parseFloat(b.pharmacyToReturn[filter]) - parseFloat(a.pharmacyToReturn[filter]));
      } else {
        if (filter == 'drug_distance' || filter == 'drug_duration') {
          var arrayToConcat = [];
          for (var index = 0; index < allPharmacies.length; index++) {
            let isMailingAddress = !allPharmacies[index].pharmacyToReturn.drug_duration
              || allPharmacies[index].pharmacyToReturn.drug_duration == 'Mail Delivery'
              || allPharmacies[index].pharmacyToReturn.drug_duration == 'Specialty Mail Order'
              ? true : false;
            if (isMailingAddress) {
              var lastElement = allPharmacies[index];
              allPharmacies.splice(index, 1);
              arrayToConcat.push(lastElement);
            }
          }
        }
        allPharmacies = allPharmacies.sort((a, b) => parseFloat(a.pharmacyToReturn[filter]) - parseFloat(b.pharmacyToReturn[filter]));
        if (filter == 'drug_distance' || filter == 'drug_duration') {
          if (arrayToConcat.length > 0) {
            allPharmacies = allPharmacies.concat(arrayToConcat)
          }
        }
      }
    }
    this.setState({
      selectedSort: value,
      pharmacyList: sortNeeded ? allPharmacies : pharmacyList,
      isInit: true
    })
  }

  // ON SORT DROPDOWN CHANGE
  handleToggleSort = (value) => {
    const { listToFilter, showOpenPharmacies, pharmacyList } = this.state;

    let allPharmacies = JSON.stringify(!showOpenPharmacies ? pharmacyList : listToFilter);
    allPharmacies = JSON.parse(allPharmacies);
    const filter = value;

    let sortNeeded = this.isSortNeeded(allPharmacies, filter);
    if (filter != 'Select' && sortNeeded) {
      if (filter == 'drug_reward') {
        allPharmacies = allPharmacies.sort((a, b) => parseFloat(b.pharmacyToReturn[filter]) - parseFloat(a.pharmacyToReturn[filter]));
      } else {
        if (filter == 'drug_distance' || filter == 'drug_duration') {
          var arrayToConcat = [];
          for (var index = 0; index < allPharmacies.length; index++) {
            let isMailingAddress = !allPharmacies[index].pharmacyToReturn.drug_duration
              || allPharmacies[index].pharmacyToReturn.drug_duration == 'Mail Delivery'
              || allPharmacies[index].pharmacyToReturn.drug_duration == 'Specialty Mail Order'
              ? true : false;
            if (isMailingAddress) {
              var lastElement = allPharmacies[index];
              allPharmacies.splice(index, 1);
              arrayToConcat.push(lastElement);
            }
          }
        }        
        allPharmacies = allPharmacies.sort((a, b) => parseFloat(a.pharmacyToReturn[filter]) - parseFloat(b.pharmacyToReturn[filter]));
        if (filter == 'drug_distance' || filter == 'drug_duration') {
          if (arrayToConcat.length > 0) {
            allPharmacies = allPharmacies.concat(arrayToConcat)
          }
        }
      }
    }
    this.setState({
      selectedSort: value,
      pharmacyList: sortNeeded ? allPharmacies : pharmacyList,
      isInit: true
    })
  }

  sortByMostValue = (value) => {
    this.setState({
      showBy: value
    });
  }

  closePharmacyFilterModal = () => {
    this.setState({
      isOpenPharmacyFilterModal: false,
    })
  }

  openPharmacyFilterModal = () => {
    this.setState({
      isOpenPharmacyFilterModal: true,
    });
  }

  checkedFilterTogglePharmacy = (value) => {
    this.setState({
      checkedFilterToggle: this.state.checkedFilterToggle == value ? 'Select' : value,
    });
  }

  applyCheckedTogglePharmacyFilter() {
    this.handleToggleSort(this.state.checkedFilterToggle);
    this.setState({
      isOpenPharmacyFilterModal: false,
    });
  }

  render() {
    const { t } = this.props;
    const { currentUser, basketPrescriptions, pharmacyList, pharmascySuccess, erxModalOpen, loading, open, modalHeadingText, modalData, isMailingAddress, savingAmount, isSplitPharmacy, locationOptions, activeLocation, quantityRestrictionMessage, restrict, isOpenPharmacyFilterModal } = this.state;
    if (this.state.activeLocation === "") {
      this.setState({ activeLocation: "Home" });
    }
    let userLoc, panes, pmnProvider, deductible_met;
    menuActiveIndex = 0;
    if (currentUser || currentUser != null) {
      userLoc = currentUser.userLocations;
      panes = [{ menuItem: userLoc[0].locationName, render: () => <Tab.Pane attached="false" as={'div'} className='ui'></Tab.Pane> }]
      for (var i = 1; i < userLoc.length; i++) {
        panes.push({ menuItem: userLoc[i].locationName, render: () => <Tab.Pane attached="false" as={'div'} className='ui'></Tab.Pane> });
        if (userLoc[i].locationName == this.state.activeLocation)
          menuActiveIndex = i;
      }
      if (locationOptions && locationOptions.length <= 0) {
        let locationArray = [{ text: t('Home'), value: "Home" }];
        for (var i = 1; i < userLoc.length; i++) {
          locationArray.push({ text: userLoc[i].locationName, value: userLoc[i].locationName });
        }
        this.setState({ locationOptions: locationArray });
      }
    }

    recentSearchedDrug = null;
    if (basketPrescriptions && basketPrescriptions.length > 0) { recentSearchedDrug = basketPrescriptions[0] }
    recentSearchHeading = commonFunctions.initCap(t("PRESCRIPTION DETAILS"));
    noPrescriptionInBasket = "No Prescritpion in the Basket";
    defaultTemplate =
      <i>
        {/* HEADER SECTION */}
        {this.renderHeaderSection()}
        {/* PRESCRIPTIONS SLIDER */}
        {(basketPrescriptions && basketPrescriptions.length > 0) &&
          this.renderCarousal(basketPrescriptions, t)
        }
      </i>

    // QUANTITY RESTRICTION POPUP
    if (this.props.isFromInPharmacy && restrict) {
      return (
        <SimpleInfoPopup isOpen={restrict}
          onClose={this.restrictClose}
          description={quantityRestrictionMessage}
          modalHeading={'Quantity Restriction'}
        />
      )
    }

    if (!pharmascySuccess || !pharmacyList) {
      // RENDERS WHILE SEARCHING
      commonFunctions.showPageLoader();
      return (
        <div className="ui segment dashboard-data parmacy-slider-sec step-details">
          <div className="search-tab-data">
            <div className="content-section">
              <div className="pharmacy-section">
                <div style={{ height: "200px", textAlign: "center", paddingTop: "300px" }}>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    else {
      if (pharmacyList && pharmacyList.length == 0) {

        commonFunctions.hidePageLoader();
        $(document).ready(function () {
          $(".presc-list-outer,.pharmacy-list").mCustomScrollbar({
            theme: "dark-thick"
          });
        });
        if (this.props.cartEditClicked) {
          this.setCurrentEditPrescriptionData(this.props.currentEditPrescription)
        }
        if (this.props.isFromInPharmacy) {
          this.onNextClick();
        }
        let editDrugs = this.state.currentEditPrescription ? this.state.currentEditDrugs : this.props.drugs;
        let currentMode = this.state.currentEditPrescription ? 'edit' : this.props.mode;
        let currentRefill = this.state.currentEditPrescription ? false : this.props.isRefill;
        return (
          <div className="ui segment dashboard-data">
            {open && <PrescriptionInfoPopup modalClass={"instruction-modal modal-data"} isOpen={open} onClose={this.close} modalData={modalData} modalHeading={modalHeadingText} modalKey='searchPharmacy' />}
            {restrict && <SimpleInfoPopup isOpen={restrict} onClose={this.restrictClose} description={quantityRestrictionMessage} modalHeading={'Quantity Restriction'} />}
            <div className="ui-inner-container search-container">
              <div className="ui grid">
                <div className="six wide column">
                  <div className="my-prescription">
                    <div className="title-block text-center">
                      <h2>My Prescriptions</h2>
                      <a href="javascript:void(0)" className="link-blue">{basketPrescriptions.length} Prescriptions</a>
                    </div>
                    <div className="prescription-box">
                      <div className="presc-list-outer">
                        <div className="ui list search-prescription-list">
                          {(basketPrescriptions && basketPrescriptions.length > 0) &&
                            this.renderMyPrescriptions(basketPrescriptions, t)
                          }
                        </div>
                      </div>
                      <div className="add-priscription" onClick={() => {
                        this.props.setIsFromSeachPharmacy(false);
                        this.props.setIsFromSearch(false);
                        this.props.setIsFromCart(false, this.props.cartPrescriptions);
                        this.props.history.replace('/search');
                      }}>
                        <a href="javascript:void(0)" className="add-pres-link"><i><img src={require("../../../style/images/plus-icon.svg")} className="icon-image" title="add" /></i> Add a prescription </a>
                      </div>
                      <div className="location-block">
                        <div className="location-inner clearfix">
                          <div className="location-dpdwn">
                            <em>Location</em>
                            <a href="javascript:void(0)" className="select-location"
                              onClick={() => {
                                $('body').addClass('activeOverlay');
                                $('.location-popup').addClass('open-popup');
                              }}>
                              {activeLocation}
                              <i>
                                <img src={require("../../../style/images/down-arrow-img.svg")} alt="down-arrow-img" />
                              </i>
                            </a>
                            <div className="add-edit">
                              <a href="javascript:void(0)" title="Add/Edit">Add/Edit</a>
                            </div>
                          </div>
                          <div className="shopping-bag">
                            <img src={require("../../../style/images/shopping-bag.svg")} className="bag-img" alt="shopping-bag" />
                            <em>{basketPrescriptions.length}</em>
                            <i><img src={require("../../../style/images/shopping-item.svg")} alt="shopping-item" /></i>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pres-overlay"
                      onClick={() => {
                        this.onPrescriptionOverlayClick()
                      }}>
                    </div>

                    {(this.props.isOpen || this.state.showEditPopup) ?
                      <ConfirmPrescriptionModal
                        {...this.props}
                        isOpen={this.props.isOpen}
                        onModalClose={this.props.onModalClose}
                        drugs={editDrugs}
                        mode={currentMode}
                        prescriptionForEdit={this.state.currentEditPrescription}
                        isRefill={currentRefill}
                        onError={this.props.showError}
                        hideError={this.props.hideError}
                        isItemClick={this.props.isItemClick}
                        setEditShow={(setEditShow) => {
                          this.setState({ showEditPopup: setEditShow })
                        }}
                      /> : null
                    }

                    {/* LOCATION POPUP - START */}
                    <div className="pres-popup location-popup">
                      <div className="edit-popup-content">
                        <div className="edit-detail">
                          <h5>Select Location</h5>
                          <em>or add a new address</em>
                          <button type="button" className="btn ui button blue-btn"
                            onClick={() => {
                              if ($('.location-popup').hasClass('open-popup')) {
                                $('.location-popup').removeClass('open-popup');
                                $('body').removeClass('activeOverlay');
                              }
                              this.onDoneClick();
                            }}
                          >Done</button>
                        </div>
                        <div className="location-inner">
                          <div className="ui list location-list" style={{ height: 200, overflow: 'auto' }}>
                            {this.renderLocationPopupOptions()}
                          </div>
                          <div className="add-address">
                            <a href="javascript:void(0)" title="Add new address"
                              onClick={() => {
                                this.setState({ addLocationOpen: true });
                              }}><i>
                                <img src={require("../../../style/images/blue-plus-icon.svg")} className="normal-img" />
                                <img src={require("../../../style/images/red-plus-icon.svg")} className="hover-img" /></i>
                              Add new address</a>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* LOCATION POPUP - END */}
                  </div>
                </div>
                <div className="eight wide column">
                  <div className="filter-prescription">
                    <span>{t('searchPharmacy.noPharmacyFoundLocation')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Location modal */}
            {
              this.state.addLocationOpen &&
              <AddLocation
                isLocationOpen={this.state.addLocationOpen}
                onLocationClose={this.addLocationclose}
                setLocation={(locationsData) => {
                  let first = [this.state.locationOptions[0]];
                  for (var i = 0; i < locationsData.length; i++) {
                    first.push({ text: locationsData[i].name, value: locationsData[i].name });
                  }
                  let oldCurrentUser = this.state.currentUser;
                  let oldLocations = oldCurrentUser.userLocations;
                  oldLocations.push(
                    {
                      locationName: locationsData[locationsData.length - 1].name,
                      locationAddress: commonFunctions.setAddress(locationsData[locationsData.length - 1].street_address, "", locationsData[locationsData.length - 1].city, locationsData[locationsData.length - 1].zip_code),
                      locationZipCode: locationsData[locationsData.length - 1].zip_code
                    }
                  );
                  oldCurrentUser =
                    {
                      ...oldCurrentUser,
                      userLocations: oldLocations,
                    }

                  this.setState({ locationOptions: first, currentUser: oldCurrentUser })
                  this.setCurrentLocation(first[first.length - 1]);
                }}
              />
            }
          </div>          
        )
      }
      if (pharmacyList && pharmacyList.length > 0) {
        $(document).ready(function () {
          $(".presc-list-outer,.pharmacy-list").mCustomScrollbar({
            theme: "dark-thick"
          });
        });
        if (this.props.cartEditClicked) {
          this.setCurrentEditPrescriptionData(this.props.currentEditPrescription)
        }
        if (this.props.isFromInPharmacy) {
          this.onNextClick();
        }
        if (!this.props.isFromInPharmacy) {
          commonFunctions.hidePageLoader();
        }
        pmnProvider = currentUser.pbm_provider; deductible_met = false; showReward = false;
        if (pharmacyList[0].pharmacyToReturn.deductible_remaining && pharmacyList[0].pharmacyToReturn.deductible_remaining == 0) {
          deductible_met = true; showReward = true;
        }
        firstSecHeading = deductible_met ? t('Your Cost') : t('Flipt Price');
        secondSecHeading = this.state.showPrice ? (pmnProvider ? pmnProvider : t('searchPharmacy.pmbText')) + " " + t('searchPharmacy.priceText') : t('Rewards');
        showPriceToggle = this.state.showPrice ? t('searchPharmacy.showRewardsText') : t('searchPharmacy.showText') + " " + (pmnProvider ? pmnProvider.toUpperCase() : t('searchPharmacy.pmbText')) + " " + t('searchPharmacy.priceText').toUpperCase();
        let editDrugs = this.state.currentEditPrescription ? this.state.currentEditDrugs : this.props.drugs;
        let currentMode = this.state.currentEditPrescription ? 'edit' : this.props.mode;
        let currentRefill = this.state.currentEditPrescription ? false : this.props.isRefill;

        return (
          <div className="ui segment dashboard-data">
            {open && <PrescriptionInfoPopup modalClass={"instruction-modal modal-data"} isOpen={open} onClose={this.close} modalData={modalData} modalHeading={modalHeadingText} modalKey='searchPharmacy' />}
            {restrict && <SimpleInfoPopup isOpen={restrict} onClose={this.restrictClose} description={quantityRestrictionMessage} modalHeading={'Quantity Restriction'} />}
            {erxModalOpen &&
              <ErxModalPopup
                {...this.props}
                isOpen={erxModalOpen}
                onClose={this.erxModalclose}
                prescs={this.state.basketPrescriptions}
                pharmacySelected={this.state.pharmacySelected}
                pharmacySearchResult={this.state.pharmacySearchResult}
                usrInfo={this.state.currentUser}
                searchPrescriptionId={this.state.searchPrescriptionId}
                routePrescritptionCall={this.props.routePrescription}
                savingAmount={savingAmount}
                isSplitPharmacy={isSplitPharmacy}
                btnLoading={loading}
                trans={this.props.t}
                isMailingAddress={isMailingAddress}
              />
            }

            <div className="ui-inner-container search-container">
              <div className="ui grid">
                <div className="six wide column">
                  <div className="my-prescription">
                    <div className="title-block text-center">
                      <h2>My Prescriptions</h2>
                      <a href="javascript:void(0)" className="link-blue">{basketPrescriptions.length} Prescriptions</a>
                    </div>
                    <div className="prescription-box">
                      <div className="presc-list-outer">
                        <div className="ui list search-prescription-list">
                          {(basketPrescriptions && basketPrescriptions.length > 0) &&
                            this.renderMyPrescriptions(basketPrescriptions, t)
                          }
                        </div>
                      </div>
                      <div className="add-priscription" onClick={() => {
                        this.props.setIsFromSeachPharmacy(false);
                        this.props.setIsFromSearch(false);
                        this.props.setIsFromCart(false, this.props.cartPrescriptions);
                        this.props.history.replace('/search');
                      }}>
                        <a href="javascript:void(0)" className="add-pres-link"><i><img src={require("../../../style/images/plus-icon.svg")} className="icon-image" title="add" /></i> Add a prescription </a>
                      </div>
                      <div className="location-block">
                        <div className="location-inner clearfix">
                          <div className="location-dpdwn">
                            <em>Location</em>
                            <a href="javascript:void(0)" className="select-location"
                              onClick={() => {
                                $('body').addClass('activeOverlay');
                                $('.location-popup').addClass('open-popup');
                              }}>
                              {activeLocation}
                              <i>
                                <img src={require("../../../style/images/down-arrow-img.svg")} alt="down-arrow-img" />
                              </i>
                            </a>
                            <div className="add-edit">
                              <a href="javascript:void(0)" title="Add/Edit">Add/Edit</a>
                            </div>
                          </div>
                          <div className="shopping-bag">
                            <img src={require("../../../style/images/shopping-bag.svg")} className="bag-img" alt="shopping-bag" />
                            <em>{basketPrescriptions.length}</em>
                            <i><img src={require("../../../style/images/shopping-item.svg")} alt="shopping-item" /></i>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pres-overlay"
                      onClick={() => {
                        this.onPrescriptionOverlayClick()
                      }}>
                    </div>

                    {(this.props.isOpen || this.state.showEditPopup) ?
                      <ConfirmPrescriptionModal
                        {...this.props}
                        isOpen={this.props.isOpen}
                        onModalClose={this.props.onModalClose}
                        drugs={editDrugs}
                        mode={currentMode}
                        prescriptionForEdit={this.state.currentEditPrescription}
                        isRefill={currentRefill}
                        onError={this.props.showError}
                        hideError={this.props.hideError}
                        isItemClick={this.props.isItemClick}
                        setEditShow={(setEditShow) => {
                          this.setState({ showEditPopup: setEditShow })
                        }}
                      /> : null
                    }

                    {/* LOCATION POPUP - START */}
                    <div className="pres-popup location-popup">
                      <div className="edit-popup-content">
                        <div className="edit-detail">
                          <h5>Select Location</h5>
                          <em>or add a new address</em>
                          <button type="button" className="btn ui button blue-btn"
                            onClick={() => {
                              if ($('.location-popup').hasClass('open-popup')) {
                                $('.location-popup').removeClass('open-popup');
                                $('body').removeClass('activeOverlay');
                              }
                              this.onDoneClick();
                            }}
                          >Done</button>
                        </div>
                        <div className="location-inner">
                          <div className="ui list location-list" style={{ height: 200, overflow: 'auto' }}>
                            {this.renderLocationPopupOptions()}
                          </div>
                          <div className="add-address">
                            <a href="javascript:void(0)" title="Add new address"
                              onClick={() => {
                                this.setState({ addLocationOpen: true });
                              }}
                            ><i>
                                <img src={require("../../../style/images/blue-plus-icon.svg")} className="normal-img" />
                                <img src={require("../../../style/images/red-plus-icon.svg")} className="hover-img" /></i>
                              Add new address</a>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* LOCATION POPUP - END */}
                  </div>
                </div>
                <div className="eight wide column">
                  <div className="filter-prescription">
                    <div className="btn-list">
                      <button className={this.state.showBy == 'mostValue' ? "ui button active" : "ui button"} onClick={() => this.sortByMostValue('mostValue')}>
                        Most Value
                        {this.state.mostValue < 0 ?
                          <span className="text--red">-${Math.abs(Math.round(this.state.mostValue))}</span>
                          :
                          <span>+${Math.round(this.state.mostValue)}</span>
                        }
                      </button>
                      <button className="ui button">
                        Favorite
                        <span className="text--green">+$10</span>
                      </button>
                      <button className={this.state.showBy == 'closestValue' ? "ui button active" : "ui button"} onClick={() => this.sortByMostValue('closestValue')}>
                        closest
                        {this.state.closestValue < 0 ?
                          <span className="text--red">-${Math.abs(Math.round(this.state.closestValue))}</span>
                          :
                          <span>+${Math.round(this.state.closestValue)}</span>
                        }
                      </button>
                    </div>
                    <div className="pharmacy-checkout">
                      <h3 className="text--light-grey">Select a pharmacy to checkout</h3>
                      <a className="link-blue">{basketPrescriptions.length} Prescription</a>
                      <button className="ui icon button shadow-btn filter-popup-btn" onClick={() => this.openPharmacyFilterModal()}>
                        <i className="icon">
                          <img src={require("../../../style/images/up-down-arrow.svg")} title="filter" />
                        </i>
                      </button>
                    </div>
                    <div className="pharmacy-list">
                      <div className="ui list">
                        {this.state.showBy == '' ?
                          this.renderPharmacyListByLocation(pharmacyList, '')
                          : this.state.showBy == 'mostValue' ?
                            this.renderPharmacyListByLocation(pharmacyList, 'desc')
                            : this.state.showBy == 'closestValue' &&
                            this.renderPharmacyListByLocation(pharmacyList, 'asc')
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL POPUP */}
            <Modal
              open={isOpenPharmacyFilterModal}
              onClose={() => this.closePharmacyFilterModal()}
              id="OpenPharmacyModalModal"
              className=
              {
                isOpenPharmacyFilterModal ? "show-more modal ui modal-data filter-popup scrolling transition visible active" : "show-more modal ui modal-data filter-popup"
              }
            >
              <div>
                <div className="header">
                  <div className="filter-title">
                    Filter Pharmacies
                </div>
                  <a className="btn ui button blue-btn reward-btn" title="Apply" onClick={() => this.applyCheckedTogglePharmacyFilter()}>Apply</a>
                </div>
                <div className="content">
                  <div className="ui list">
                    <div className="item">
                      <div className={this.state.checkedFilterToggle == 'drug_distance' ? 'ui toggle checkbox checked' : 'ui toggle checkbox'} onClick={() => this.checkedFilterTogglePharmacy('drug_distance')}>
                        <input type="checkbox" name="public" tabIndex={0} className="hidden" checked={this.state.checkedFilterToggle == 'drug_distance' ? 'checked' : ''} onChange={() => { }} />
                        <label>Distance</label>
                      </div>
                    </div>
                    <div className="item">
                      <div className={this.state.checkedFilterToggle == 'drug_duration' ? 'ui toggle checkbox checked' : 'ui toggle checkbox'} onClick={() => this.checkedFilterTogglePharmacy('drug_duration')}>
                        <input type="checkbox" name="public" tabIndex={1} className="hidden" checked={this.state.checkedFilterToggle == 'drug_duration' ? 'checked' : ''} onChange={() => { }} />
                        <label>Time</label>
                      </div>
                    </div>
                    <div className="item">
                      <div className={this.state.checkedFilterToggle == 'pbm_price' ? 'ui toggle checkbox checked' : 'ui toggle checkbox'} onClick={() => this.checkedFilterTogglePharmacy('pbm_price')}>
                        <input type="checkbox" name="public" tabIndex={2} className="hidden" checked={this.state.checkedFilterToggle == 'pbm_price' ? 'checked' : ''} onChange={() => { }} />
                        <label>Cost</label>
                      </div>
                    </div>
                    <div className="item">
                      <div className={this.state.checkedFilterToggle == 'drug_reward' ? 'ui toggle checkbox checked' : 'ui toggle checkbox'} onClick={() => this.checkedFilterTogglePharmacy('drug_reward')}>
                        <input type="checkbox" name="public" tabIndex={3} className="hidden" checked={this.state.checkedFilterToggle == 'drug_reward' ? 'checked' : ''} onChange={() => { }} />
                        <label>Rewards</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </Modal>
          </div>
        )
      }
    }
  }
}

export default translate('translations')(PharmacySearch);