export default store => next => action => {
    console.log('ACTION', action);
    console.log('BEFORE ACTION', store.getState());
    next(action);
    console.log('AFTER ACTION', store.getState());
}
