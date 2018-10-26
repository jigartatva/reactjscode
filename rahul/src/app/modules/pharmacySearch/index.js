import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { graphql } from 'react-apollo';
import * as viewsActions from '../../../redux/modules/views';
import * as userActions from '../../../redux/modules/user';
import * as prescriptionsActions from '../../../redux/modules/Prescription/prescriptions';
import getDrugPrices from '../../../gql/mutations/getDrugPrices.gql';
import routePrescription from '../../../gql/mutations/routePrescription.gql';
import savePrescriptionSearchDetail from '../../../gql/mutations/savePrescriptionSearchDetail.gql';
import PharmacySearch from './PharmacySearch';

const getDrugPricesOptions = {
  props: ({ ownProps, mutate }) => ({
    async getDrugPrices(prescription) {
      try {
        const payload = { variables: prescription.variables };
        const { data: { getDrugPrices } } = await mutate(payload);
        return Promise.resolve(getDrugPrices);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  }),
};

const savePrescriptionSearchDetailOptions = {
  props: ({ ownProps, mutate }) => ({
    async savePrescriptionSearchDetail(prescription) {
      try {
        const payload = { variables: prescription.stats };
        const { data: { savePrescriptionSearchDetail } } = await mutate(payload);
        return Promise.resolve(savePrescriptionSearchDetail);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  }),
};

const routePrescriptionOptions = {
  props: ({ ownProps, mutate }) => ({
    async routePrescription(prescription) {
      try {
        const payload = { variables: prescription.variables };
        const { data: { routePrescription } } = await mutate(payload);
        return Promise.resolve(getDrugPrices);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  }),
};


const mapStateToProps = state => {
  return {
    currentView: state.views.currentView,
    cartEditClicked:state.prescriptions.cartEditClicked,
    currentEditPrescription:state.prescriptions.currentEditPrescription,
    savedPrescriptions: state.prescriptions.savedPrescriptions,
    waitingPrescriptions: state.prescriptions.waitingPrescriptions,
    isFromInPharmacy: state.prescriptions.isFromInPharmacy,
    isShowAllWaitingPrescriptions: state.prescriptions.isShowAllWaitingPrescriptions,
    selectedWaitingPrescription: state.prescriptions.selectedWaitingPrescription,
    waitingPrescriptionsCount: state.prescriptions.waitingPrescriptionsCount,
    isFromSearchPharmacy: state.prescriptions.isFromSearchPharmacy,
    basket: state.user.basket,
    pharmacyList: state.prescriptions.pharmacyList,
    isFromCart: state.prescriptions.isFromCart,
    cartPrescriptions: state.prescriptions.cartPrescriptions,
    temporaryPrescriptions: state.prescriptions.temporaryPrescriptions,
    messages: state.user.userMessages,
    userData: state.userAuth.userInfo.employee ? state.userAuth.userInfo.employee : state.userAuth.userInfo.dependent,
    isAdmin: state.userAuth.userInfo.employee
      ? state.userAuth.userInfo.employee.cc_admin && state.userAuth.userInfo.employee.cc_admin == "YES"
        ? true
        : false
      : state.userAuth.userInfo.dependent.cc_admin && state.userAuth.userInfo.dependent.cc_admin == "YES"
        ? true
        : false
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      ...viewsActions,
      ...userActions,
      ...prescriptionsActions
    },
    dispatch
  );
};

const DrugPrices = graphql(getDrugPrices, getDrugPricesOptions)(PharmacySearch)
const SavePrescriptionDetail = graphql(savePrescriptionSearchDetail, savePrescriptionSearchDetailOptions)(DrugPrices)
const RoutePrescription = graphql(routePrescription, routePrescriptionOptions)(SavePrescriptionDetail)
export default connect(mapStateToProps, mapDispatchToProps)(RoutePrescription);
