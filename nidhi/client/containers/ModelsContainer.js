import _ from 'lodash';
import { actionRequest, actionSuccess, actionFail } from '../helpers/action';
import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { ACTION_MODELS_LIST, ACTION_MODELS_NEW, ACTION_MODELS_DELETE, ACTION_MODELS_DUPLICATE, ACTION_GET_USER_STRIPE_DATA } from '../constants';
import { modelsList, modelsNew, modelsDelete, getStripeData } from '../actions/models';
import { modelsNameList } from '../actions/actions';

import { Button } from 'react-toolbox/lib/button';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Tab, Tabs, FontIcon } from 'react-toolbox';

import { trackEvent } from '../helpers/mixpanel';
import Header from '../components/Header';
import Model from '../components/models/Model';
import styles from './models-container.scss';
import ShowTutorialDialog from '../components/models/ShowTutorialDialog';
import ShowWelcomeDialog from '../components/ShowWelcomeDialog';
import DeleteModelDialog from '../components/DeleteModelDialog';
import Snackbar from 'material-ui/Snackbar';
import config from '../config';
const productAPI = `${config.paymentURL}/product/`;

const ModelsContainer = React.createClass({
    deleteTimeout: null,
    getInitialState() {
        return {
            showTutorialDialog: false,
            addNewModelMenuOpen: false,
            index: 1,
            fixedIndex: 1,
            inverseIndex: 1,
            isLoading: false,
            modelIds: [],
            deletedModel: null,
            autoHideDuration: 4000,
            message: 'Model removed.',
            open: false,
            totalModel: 0,
            modellist: [],
            isactive: false,
            currentModelID: '',
            currentModelName: '',
            currentPlanData: []
        };
    },

    componentDidMount() {
        this.setState({ isLoading: true });
        this.props.modelsList();
        this.props.getStripeData();
    },
    componentWillMount() {
    },
    componentWillReceiveProps(nextProps, nextState) {
        const allModelName = [];
        _.delay(() => {
            fetch(productAPI).then(res => res.json()).then(res => {
                const planId = this.props.productid || res.data[1].id;
                const planid = _.find(res.data, (planvalue) => {
                    if (planId == planvalue.id) {
                        return planvalue;
                    }
                });
                this.setState({ currentPlanData: planid.metadata });
            });
            if (actionSuccess(ACTION_MODELS_NEW, nextProps.actionType, nextProps.actionStatus)) {
                this.props.modelNewSuccess(nextProps.modelId);
            }

            if (actionSuccess(ACTION_MODELS_DUPLICATE, nextProps.actionType, nextProps.actionStatus)) {
                this.props.modelNewSuccess(nextProps.modelId);
            }

            if (actionSuccess(ACTION_MODELS_DELETE, nextProps.actionType, nextProps.actionStatus)) {
                this.props.modelsList();
            }
            if (actionSuccess(ACTION_MODELS_LIST, nextProps.actionType, nextProps.actionStatus) ||
                actionFail(ACTION_MODELS_LIST, nextProps.actionType, nextProps.actionStatus)) {
                this.setState({ isLoading: false });
                const Ids = _.map(this.props.models, (model) => {
                    if (model.id) { return model.id; }
                });
                const countModel = _.filter(this.props.models, (model) => {
                    if (model.id) {
                        allModelName.push(model.name);
                        return model;
                    }
                });
                if (!_.isEmpty(allModelName)) {
                    this.props.modelsNameList(allModelName);
                }
                this.setState({ modelIds: _.compact(Ids), totalModel: countModel.length, modellist: countModel });
            }
            if (actionSuccess(ACTION_MODELS_LIST, nextProps.actionType, nextProps.actionStatus) && window.firebase && window.FS) {
                const user = window.firebase.auth().currentUser;
                window.FS.identify(user.uid, {
                    displayName: user.displayName,
                    email: user.email,
                    currentPlan: 'Free',
                    InvitedBy: '',
                    noModels: nextProps.models ? nextProps.models.length : 0
                });
            }
        });
    },

    componentWillUnmount() {
        clearTimeout(this.deleteTimeout);
    },

    isWordExist(keyword, string) {
        const personRegExp = new RegExp(keyword, 'gi');
        if (personRegExp.test(string)) {
            return true;
        } else {
            return false;
        }
    },

    handleToggle() {
        this.setState({ showTutorialDialog: false, addNewModelMenuOpen: false });
        window.location.hash = '';
    },
    openWelcome() {
        this.setState({
            showTutorialDialog: false,
            addNewModelMenuOpen: true
        });
    },

    closeSnackbar() {
        if (this.state.open && this.state.deletedModel !== null) {
            this.props.modelsDelete(this.state.deletedModel);
            this.setState({ open: false, deletedModel: null });
        }
    },

    renderNoModule() {
        return (
            <div className={styles.emptyDeshboard}>
                <span className={styles.text1}>Time To Create Your First Model!</span>
                <span className={styles.text2}>A model is a visual map of a project, a topic, or an idea.</span>
                <div className={styles.leuimage}>
                    <img src="../public/assets/empty_models.png" style={{ maxWidth: '430px', border: '2.5px solid #4A4A4A', borderRadius: '10px' }} />
                </div>
                <div className={styles.links}>
                    <Button onClick={() => this.setState({ addNewModelMenuOpen: !this.state.addNewModelMenuOpen })} className={styles.addNewModel} raised accent>  + new model</Button>
                    <Button className={styles.learnMOre} onClick={() => { trackEvent('Opening Tutorials Dialog'); this.setState({ showTutorialDialog: true }) }} raised primary>learn more</Button>
                </div>
                <ShowTutorialDialog currentVideo={document.location.hash || 1} active={this.state.showTutorialDialog} handleToggle={this.handleToggle} />
                <ShowWelcomeDialog active={this.state.addNewModelMenuOpen} handleToggle={this.handleToggle} openWelcome={this.openWelcome} />
            </div>
        )
    },

    render() {
        if (_.isEmpty(this.state.models) || this.state.isLoading) {
            if (this.props.modelsLoading || this.state.isLoading) {
                return (
                    <div className={styles.layout}>
                        <Header loading={this.props.modelsLoading || this.state.isLoading} planMetaData={this.state.currentPlanData} totalmodel={this.state.totalModel} open={this.state.open} />
                        <div className={styles.modelsContainer}>
                            <ProgressBar className={styles.loadingModels} type='circular' mode='indeterminate' multicolor />
                        </div>
                    </div>
                );
            }
        }
        const isNotEmpty = this.state.modelIds && this.state.modelIds.length > 0;
        return (
            <div className={styles.layout}>
                <Header loading={this.props.modelsLoading || this.state.isLoading} planMetaData={this.state.currentPlanData} totalmodel={this.state.totalModel} open={this.state.open} />
                <div className={styles.modelsContainer} style={!isNotEmpty ? { background: "url('../public/assets/empty-state.jpg') 0 -5px", backgroundSize: 'cover' } : {}}>
                    {isNotEmpty ? this.renderModels() : this.renderNoModule()}
                    <Snackbar
                        open={this.state.open}
                        message={this.state.message}
                        action="undo"
                        onActionTouchTap={this.handleActionClick}
                        autoHideDuration={this.state.autoHideDuration}
                        onRequestClose={this.closeSnackbar}
                        className={styles.snackbar}
                        style={{ transform: 'translate(0px, 0px)', height: 'max-content', left: 'auto', position: 'absolute', right: "15px", top: '0%' }}
                        contentStyle={{ fontSize: '17px', display: 'inline' }}
                    />
                </div>
            </div>
        );
    },

    // Delete current selected model from list

    deleteCurrentModel(currentModelID, currentModelName) {
        clearTimeout(this.deleteTimeout);
        const { modelsDelete } = this.props;
        const msg = `${currentModelName} has been deleted.`;
        this.setState({ open: true, isactive: false, deletedModel: currentModelID, message: msg });
        let modelListIds = this.state.modelIds;
        if (currentModelID) {
            modelListIds = _.pull(modelListIds, currentModelID);
            this.setState({ modelIds: modelListIds });
        }
        this.deleteTimeout = setTimeout(() => {
            if (this.state.deletedModel !== null) {
                this.props.modelsDelete(currentModelID);
                this.setState({ open: false, currentModelID: '', currentModelName: '', deletedModel: null });
            }
        }, 4000);
    },

    handleActionClick() {
        this.setState({ open: false, deletedModel: null });
        clearTimeout(this.deleteTimeout);
        this.props.modelsList(); // Get list of models.
    },

    deletehandleToggle() {
        this.setState({ isactive: false, currentModelID: '', currentModelName: '' });
    },
    renderModels() {
        const searchKey = this.props.searchKeyword;
        const title = <div style={{ padding: '24px 24px 0px' }}><span>Delete this Model?</span><FlatButton
            icon={<FontIcon value='close' style={{ color: '#727272' }} />}
            style={{ position: 'absolute', right: 25, top: 25, height: 'auto', minWidth: 'inherit', lineHeight: 'inherit', color: '#000', padding: 0 }}
            primary={true}
            onClick={this.deletehandleToggle}
        /></div>;
        return (
            <ul className={styles.modelList}>
                {_.map(this.props.models, (model) => {
                    if ((searchKey != '' && !this.isWordExist(searchKey, model.name)) || !model.id || this.state.deletedModel == model.id) {
                        return false;
                    }
                    return <li key={model.id} className={styles.modelItem}>
                        <Model model={model} open={this.state.open} planMetaData={this.state.currentPlanData} totalmodel={this.state.totalModel} modellist={this.state.modellist} deleteModel={(modelId, modelName) => { this.setState({ isactive: true, currentModelID: modelId, currentModelName: modelName }) }} />
                    </li>
                })}
                <DeleteModelDialog
                    active={this.state.isactive}
                    handleToggle={this.deletehandleToggle}
                    deletemodel={(modelId, modelName) => { this.deleteCurrentModel(modelId, modelName) }}
                    modelID={this.state.currentModelID}
                    modelname={this.state.currentModelName} />
            </ul>
        )
    }
});

function mapStateToProps(state, ownProps) {
    const actionStatus = _.get(state, 'models.actionStatus');
    const actionType = _.get(state, 'models.type');
    return {
        actionStatus: actionStatus,
        actionType: actionType,
        modelId: _.get(state, 'models.modelId'),
        models: _.get(state, 'models.models'),
        modelsLoading: actionRequest(ACTION_MODELS_LIST, actionType, actionStatus),
        searchKeyword: _.get(state, 'graphUi.searchKeyword', null) || '',
        login: _.get(state, 'login') || {},
        productid: _.get(state, 'models.productid'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        modelsList: () => {
            dispatch(modelsList());
        },
        modelsNameList: (modelsname) => {
            dispatch(modelsNameList(modelsname));
        },
        modelNewSuccess: (modelId) => {
            dispatch(push(`/model/${modelId}`));
        },
        navigateToLoginScreen: () => {
            dispatch(push('/login'));
        },
        modelsDelete: (modelId) => {
            dispatch(modelsDelete(modelId));
        },
        modelsNew: () => {
            dispatch(modelsNew());
        },
        getStripeData: () => {
            dispatch(getStripeData());
        },
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ModelsContainer);
