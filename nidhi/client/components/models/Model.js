import { commonDateTime } from '../../helpers/datetime';
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Link } from 'react-router'
import classNames from 'classnames';
import { modelsDelete, modelsDuplicate, modelsList } from '../../actions/models';
import { Button } from 'react-toolbox/lib/button';
import { IconMenu, MenuItem, MenuDivider } from 'react-toolbox/lib/menu';
import { Card, CardTitle, CardMedia } from 'react-toolbox/lib/card';

import ShowPlanModelDialog from '../ShowPlanModelDialog';
import styles from './model.scss';

const Model = React.createClass({
    getInitialState() {
        return {
            hover: false,
            newModelName: '',
            stateNewNodeTemp: '',
            openPlanModel: false,
        };
    },

    onActionsMenuClick(e) {
        e.stopPropagation();
    },

    handleToggle() {
        this.setState({
            openPlanModel: false,
        });
        window.location.hash = '';
    },

    delete(e) {
        e.stopPropagation();
        this.props.modelsDelete(this.props.model.id);
    },

    duplicate(e) {
        e.stopPropagation();
        const matchedElements = [0];
        const existingModelsName = this.props.modellist;
        const regExCountDuplicates = /\([0-9]+\)$/; // Tatva-sh
        const currentModelName = this.props.model.name.replace(regExCountDuplicates, '').trim(); // Tatva-sh
        let match = this.props.model.name.match(regExCountDuplicates);
        if (match) {
            matchedElements.push(parseInt(match[0].replace(/\(/, "").replace(/\)/, "")));
        }
        const matchedCount = _.countBy(existingModelsName, (modelname) => { // Tatva-sh
            const thisModelName = modelname.name.replace(regExCountDuplicates, '').trim();
            if (currentModelName === thisModelName) {
                match = modelname.name.match(regExCountDuplicates);
                if (match) {
                    matchedElements.push(parseInt(match[0].replace(/\(/, "").replace(/\)/, "")));
                }
            }
        });

        _.delay(() => {
            const newName = `${currentModelName} (${_.max(matchedElements) + 1})`;
            this.setState({ newModelName: newName });
            this.props.modelsDuplicate(this.props.model.id, this.state.newModelName);
        }, 10);
    },

    render() {
        const model = this.props.model;
        return (
            <div>
            <Card
                className={styles.model} raised={this.state.hover}
                onMouseEnter={() => this.setState({ hover: true })}
                onMouseLeave={() => this.setState({ hover: false })}
                onClick={this.props.navigateToModel}
            >
                <CardMedia aspectRatio="wide" image="/public/models/Wigwam-Placeholder@2x.png" />
                <div className={styles.footer}>
                    <IconMenu className={styles.actions} onClick={this.onActionsMenuClick}>
                        <span onClick={() => {}}><MenuItem value='delete'
                              icon='delete' caption='Delete'
                              onClick={() => { this.props.deleteModel(model.id , model.name) }}/></span>
                        {/* <span onClick={()=>{}}><MenuItem value='duplicate' icon='content_copy' caption='Duplicate' onClick={this.duplicate} /></span> */}
                        <span onClick={() => {}}><MenuItem value='duplicate' icon='content_copy' caption='Duplicate' onClick={(e) => { ((this.props.totalmodel >= this.props.planMetaData.free_models) && (this.props.planMetaData.free_models != -1)) ? this.setState({ openPlanModel: !this.state.openPlanModel }) : this.duplicate(e) }} /></span>
                    </IconMenu>
                    <div className={styles.text}>
                        <div className={styles.name}>{model.name}</div>
                        <div className={styles.updated}>{`Last updated ${commonDateTime(model.modified)}`}</div>
                    </div>
                </div>
            </Card>
             <ShowPlanModelDialog active={this.state.openPlanModel} handleToggle={this.handleToggle} />
             </div>
        );
    }

});

function mapStateToProps(state) {
    return {
        models: state.models
    }
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        navigateToModel: (e) => {
            dispatch(push(`/model/${ownProps.model.id}`));
        },
        modelsDelete: (modelId) => {
            dispatch(modelsDelete(modelId));
        },
        modelsDuplicate: (modelId, name) => {
            dispatch(modelsDuplicate(modelId, name));
        },
        modelsList: () => { dispatch(modelsList()) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Model);
