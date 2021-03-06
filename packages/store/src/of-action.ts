import { OperatorFunction, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { getActionTypeFromInstance } from './utils';
import { ActionContext, ActionStatus } from './actions-stream';

export function ofAction<T>(allowedType): OperatorFunction<any, T>;
export function ofAction<T>(...allowedTypes): OperatorFunction<any, T>;

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will grab actions that have just been dispatched as well as actions that have completed
 */
export function ofAction(...allowedTypes: any[]) {
  return ofActionOperator(allowedTypes);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been dispatched
 */
export function ofActionDispatched(...allowedTypes: any[]) {
  return ofActionOperator(allowedTypes, ActionStatus.Dispatched);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been completed
 */
export function ofActionCompleted(...allowedTypes: any[]) {
  return ofActionOperator(allowedTypes, ActionStatus.Completed);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been completed
 */
export function ofActionCanceled(...allowedTypes: any[]) {
  return ofActionOperator(allowedTypes, ActionStatus.Canceled);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have thrown an error
 */
export function ofActionErrored(...allowedTypes: any[]) {
  return ofActionOperator(allowedTypes, ActionStatus.Errored);
}

function ofActionOperator(allowedTypes: any[], status?: ActionStatus) {
  const allowedMap = createAllowedMap(allowedTypes);
  return function(o: Observable<any>) {
    return o.pipe(filterStatus(allowedMap, status), mapAction());
  };
}

function filterStatus(allowedTypes: { [key: string]: boolean }, status?: ActionStatus) {
  return filter((ctx: ActionContext) => {
    const actionType = getActionTypeFromInstance(ctx.action);
    const type = allowedTypes[actionType];
    return status ? type && ctx.status === status : type;
  });
}

function mapAction() {
  return map((ctx: ActionContext) => ctx.action);
}

function createAllowedMap(types: any[]): { [key: string]: boolean } {
  return types.reduce((acc: any, klass: any) => {
    acc[getActionTypeFromInstance(klass)] = true;
    return acc;
  }, {});
}
