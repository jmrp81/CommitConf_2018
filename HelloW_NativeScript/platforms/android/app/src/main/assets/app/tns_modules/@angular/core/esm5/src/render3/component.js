/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { assertComponentType, assertDefined } from './assert';
import { getComponentViewByInstance } from './context_discovery';
import { getComponentDef } from './definition';
import { queueInitHooks, queueLifecycleHooks } from './hooks';
import { CLEAN_PROMISE, baseDirectiveCreate, createLViewData, createNodeAtIndex, createTView, detectChangesInternal, enterView, executeInitAndContentHooks, getOrCreateTView, leaveView, locateHostElement, prefillHostVars, resetComponentState, setHostBindings } from './instructions';
import { domRendererFactory3 } from './interfaces/renderer';
import { CONTEXT, HEADER_OFFSET, HOST, HOST_NODE, INJECTOR, TVIEW } from './interfaces/view';
import { getRootView, readElementValue, readPatchedLViewData, stringify } from './util';
// Root component will always have an element index of 0 and an injector size of 1
var ROOT_EXPANDO_INSTRUCTIONS = [0, 1];
// TODO: A hack to not pull in the NullInjector from @angular/core.
export var NULL_INJECTOR = {
    get: function (token, notFoundValue) {
        throw new Error('NullInjector: Not found: ' + stringify(token));
    }
};
/**
 * Bootstraps a Component into an existing host element and returns an instance
 * of the component.
 *
 * Use this function to bootstrap a component into the DOM tree. Each invocation
 * of this function will create a separate tree of components, injectors and
 * change detection cycles and lifetimes. To dynamically insert a new component
 * into an existing tree such that it shares the same injection, change detection
 * and object lifetime, use {@link ViewContainer#createComponent}.
 *
 * @param componentType Component to bootstrap
 * @param options Optional parameters which control bootstrapping
 */
export function renderComponent(componentType /* Type as workaround for: Microsoft/TypeScript/issues/4881 */, opts) {
    if (opts === void 0) { opts = {}; }
    ngDevMode && assertComponentType(componentType);
    var rendererFactory = opts.rendererFactory || domRendererFactory3;
    var sanitizer = opts.sanitizer || null;
    var componentDef = getComponentDef(componentType);
    if (componentDef.type != componentType)
        componentDef.type = componentType;
    // The first index of the first selector is the tag name.
    var componentTag = componentDef.selectors[0][0];
    var hostRNode = locateHostElement(rendererFactory, opts.host || componentTag);
    var rootFlags = componentDef.onPush ? 4 /* Dirty */ | 64 /* IsRoot */ :
        2 /* CheckAlways */ | 64 /* IsRoot */;
    var rootContext = createRootContext(opts.scheduler || requestAnimationFrame.bind(window), opts.playerHandler || null);
    var renderer = rendererFactory.createRenderer(hostRNode, componentDef);
    var rootView = createLViewData(renderer, createTView(-1, null, 1, 0, null, null, null), rootContext, rootFlags);
    rootView[INJECTOR] = opts.injector || null;
    var oldView = enterView(rootView, null);
    var component;
    try {
        if (rendererFactory.begin)
            rendererFactory.begin();
        var componentView = createRootComponentView(hostRNode, componentDef, rootView, renderer, sanitizer);
        component = createRootComponent(hostRNode, componentView, componentDef, rootView, rootContext, opts.hostFeatures || null);
        executeInitAndContentHooks();
        detectChangesInternal(componentView, component);
    }
    finally {
        leaveView(oldView);
        if (rendererFactory.end)
            rendererFactory.end();
    }
    return component;
}
/**
 * Creates the root component view and the root component node.
 *
 * @param rNode Render host element.
 * @param def ComponentDef
 * @param rootView The parent view where the host node is stored
 * @param renderer The current renderer
 * @param sanitizer The sanitizer, if provided
 *
 * @returns Component view created
 */
export function createRootComponentView(rNode, def, rootView, renderer, sanitizer) {
    resetComponentState();
    var tView = rootView[TVIEW];
    var componentView = createLViewData(renderer, getOrCreateTView(def.template, def.consts, def.vars, def.directiveDefs, def.pipeDefs, def.viewQuery), null, def.onPush ? 4 /* Dirty */ : 2 /* CheckAlways */, sanitizer);
    var tNode = createNodeAtIndex(0, 3 /* Element */, rNode, null, null);
    if (tView.firstTemplatePass) {
        tView.expandoInstructions = ROOT_EXPANDO_INSTRUCTIONS.slice();
        if (def.diPublic)
            def.diPublic(def);
        tNode.flags =
            rootView.length << 15 /* DirectiveStartingIndexShift */ | 4096 /* isComponent */;
    }
    // Store component view at node index, with node as the HOST
    componentView[HOST] = rootView[HEADER_OFFSET];
    componentView[HOST_NODE] = tNode;
    return rootView[HEADER_OFFSET] = componentView;
}
/**
 * Creates a root component and sets it up with features and host bindings. Shared by
 * renderComponent() and ViewContainerRef.createComponent().
 */
export function createRootComponent(hostRNode, componentView, componentDef, rootView, rootContext, hostFeatures) {
    // Create directive instance with factory() and store at next index in viewData
    var component = baseDirectiveCreate(rootView.length, componentDef.factory(), componentDef, hostRNode);
    rootContext.components.push(component);
    componentView[CONTEXT] = component;
    hostFeatures && hostFeatures.forEach(function (feature) { return feature(component, componentDef); });
    if (rootView[TVIEW].firstTemplatePass)
        prefillHostVars(componentDef.hostVars);
    setHostBindings();
    return component;
}
export function createRootContext(scheduler, playerHandler) {
    return {
        components: [],
        scheduler: scheduler,
        clean: CLEAN_PROMISE,
        playerHandler: playerHandler || null,
        flags: 0 /* Empty */
    };
}
/**
 * Used to enable lifecycle hooks on the root component.
 *
 * Include this feature when calling `renderComponent` if the root component
 * you are rendering has lifecycle hooks defined. Otherwise, the hooks won't
 * be called properly.
 *
 * Example:
 *
 * ```
 * renderComponent(AppComponent, {features: [RootLifecycleHooks]});
 * ```
 */
export function LifecycleHooksFeature(component, def) {
    var rootTView = readPatchedLViewData(component)[TVIEW];
    var dirIndex = rootTView.data.length - 1;
    queueInitHooks(dirIndex, def.onInit, def.doCheck, rootTView);
    queueLifecycleHooks(dirIndex << 15 /* DirectiveStartingIndexShift */ | 1, rootTView);
}
/**
 * Retrieve the root context for any component by walking the parent `LView` until
 * reaching the root `LView`.
 *
 * @param component any component
 */
function getRootContext(component) {
    var rootContext = getRootView(component)[CONTEXT];
    ngDevMode && assertDefined(rootContext, 'rootContext');
    return rootContext;
}
/**
 * Retrieve the host element of the component.
 *
 * Use this function to retrieve the host element of the component. The host
 * element is the element which the component is associated with.
 *
 * @param component Component for which the host element should be retrieved.
 */
export function getHostElement(component) {
    return readElementValue(getComponentViewByInstance(component));
}
/**
 * Retrieves the rendered text for a given component.
 *
 * This function retrieves the host element of a component and
 * and then returns the `textContent` for that element. This implies
 * that the text returned will include re-projected content of
 * the component as well.
 *
 * @param component The component to return the content text for.
 */
export function getRenderedText(component) {
    var hostElement = getHostElement(component);
    return hostElement.textContent || '';
}
/**
 * Wait on component until it is rendered.
 *
 * This function returns a `Promise` which is resolved when the component's
 * change detection is executed. This is determined by finding the scheduler
 * associated with the `component`'s render tree and waiting until the scheduler
 * flushes. If nothing is scheduled, the function returns a resolved promise.
 *
 * Example:
 * ```
 * await whenRendered(myComponent);
 * ```
 *
 * @param component Component to wait upon
 * @returns Promise which resolves when the component is rendered.
 */
export function whenRendered(component) {
    return getRootContext(component).clean;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBUUgsT0FBTyxFQUFDLG1CQUFtQixFQUFFLGFBQWEsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUM1RCxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFBQyxjQUFjLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDNUQsT0FBTyxFQUFDLGFBQWEsRUFBRSxtQkFBbUIsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLHFCQUFxQixFQUFFLFNBQVMsRUFBRSwwQkFBMEIsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLG1CQUFtQixFQUFFLGVBQWUsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBSXhSLE9BQU8sRUFBK0MsbUJBQW1CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN4RyxPQUFPLEVBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBd0QsS0FBSyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakosT0FBTyxFQUFDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFJdEYsa0ZBQWtGO0FBQ2xGLElBQU0seUJBQXlCLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFzRHpDLG1FQUFtRTtBQUNuRSxNQUFNLENBQUMsSUFBTSxhQUFhLEdBQWE7SUFDckMsR0FBRyxFQUFFLFVBQUMsS0FB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QUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDekYsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBUyxjQUFjLENBQUMsU0FBYztJQUNwQyxJQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFnQixDQUFDO0lBQ25FLFNBQVMsSUFBSSxhQUFhLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLGNBQWMsQ0FBSSxTQUFZO0lBQzVDLE9BQU8sZ0JBQWdCLENBQUMsMEJBQTBCLENBQUMsU0FBUyxDQUFDLENBQWdCLENBQUM7QUFDaEYsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSxlQUFlLENBQUMsU0FBYztJQUM1QyxJQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDOUMsT0FBTyxXQUFXLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztBQUN2QyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FBQyxTQUFjO0lBQ3pDLE9BQU8sY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN6QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBXZSBhcmUgdGVtcG9yYXJpbHkgaW1wb3J0aW5nIHRoZSBleGlzdGluZyB2aWV3RW5naW5lIGZyb20gY29yZSBzbyB3ZSBjYW4gYmUgc3VyZSB3ZSBhcmVcbi8vIGNvcnJlY3RseSBpbXBsZW1lbnRpbmcgaXRzIGludGVyZmFjZXMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJy4uL2RpL2luamVjdG9yJztcbmltcG9ydCB7U2FuaXRpemVyfSBmcm9tICcuLi9zYW5pdGl6YXRpb24vc2VjdXJpdHknO1xuXG5pbXBvcnQge2Fzc2VydENvbXBvbmVudFR5cGUsIGFzc2VydERlZmluZWR9IGZyb20gJy4vYXNzZXJ0JztcbmltcG9ydCB7Z2V0Q29tcG9uZW50Vmlld0J5SW5zdGFuY2V9IGZyb20gJy4vY29udGV4dF9kaXNjb3ZlcnknO1xuaW1wb3J0IHtnZXRDb21wb25lbnREZWZ9IGZyb20gJy4vZGVmaW5pdGlvbic7XG5pbXBvcnQge3F1ZXVlSW5pdEhvb2tzLCBxdWV1ZUxpZmVjeWNsZUhvb2tzfSBmcm9tICcuL2hvb2tzJztcbmltcG9ydCB7Q0xFQU5fUFJPTUlTRSwgYmFzZURpcmVjdGl2ZUNyZWF0ZSwgY3JlYXRlTFZpZXdEYXRhLCBjcmVhdGVOb2RlQXRJbmRleCwgY3JlYXRlVFZpZXcsIGRldGVjdENoYW5nZXNJbnRlcm5hbCwgZW50ZXJWaWV3LCBleGVjdXRlSW5pdEFuZENvbnRlbnRIb29rcywgZ2V0T3JDcmVhdGVUVmlldywgbGVhdmVWaWV3LCBsb2NhdGVIb3N0RWxlbWVudCwgcHJlZmlsbEhvc3RWYXJzLCByZXNldENvbXBvbmVudFN0YXRlLCBzZXRIb3N0QmluZGluZ3N9IGZyb20gJy4vaW5zdHJ1Y3Rpb25zJztcbmltcG9ydCB7Q29tcG9uZW50RGVmLCBDb21wb25lbnRUeXBlfSBmcm9tICcuL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge1RFbGVtZW50Tm9kZSwgVE5vZGVGbGFncywgVE5vZGVUeXBlfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge1BsYXllckhhbmRsZXJ9IGZyb20gJy4vaW50ZXJmYWNlcy9wbGF5ZXInO1xuaW1wb3J0IHtSRWxlbWVudCwgUk5vZGUsIFJlbmRlcmVyMywgUmVuZGVyZXJGYWN0b3J5MywgZG9tUmVuZGVyZXJGYWN0b3J5M30gZnJvbSAnLi9pbnRlcmZhY2VzL3JlbmRlcmVyJztcbmltcG9ydCB7Q09OVEVYVCwgSEVBREVSX09GRlNFVCwgSE9TVCwgSE9TVF9OT0RFLCBJTkpFQ1RPUiwgTFZpZXdEYXRhLCBMVmlld0ZsYWdzLCBSb290Q29udGV4dCwgUm9vdENvbnRleHRGbGFncywgVFZJRVd9IGZyb20gJy4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7Z2V0Um9vdFZpZXcsIHJlYWRFbGVtZW50VmFsdWUsIHJlYWRQYXRjaGVkTFZpZXdEYXRhLCBzdHJpbmdpZnl9IGZyb20gJy4vdXRpbCc7XG5cblxuXG4vLyBSb290IGNvbXBvbmVudCB3aWxsIGFsd2F5cyBoYXZlIGFuIGVsZW1lbnQgaW5kZXggb2YgMCBhbmQgYW4gaW5qZWN0b3Igc2l6ZSBvZiAxXG5jb25zdCBST09UX0VYUEFORE9fSU5TVFJVQ1RJT05TID0gWzAsIDFdO1xuXG4vKiogT3B0aW9ucyB0aGF0IGNvbnRyb2wgaG93IHRoZSBjb21wb25lbnQgc2hvdWxkIGJlIGJvb3RzdHJhcHBlZC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRlQ29tcG9uZW50T3B0aW9ucyB7XG4gIC8qKiBXaGljaCByZW5kZXJlciBmYWN0b3J5IHRvIHVzZS4gKi9cbiAgcmVuZGVyZXJGYWN0b3J5PzogUmVuZGVyZXJGYWN0b3J5MztcblxuICAvKiogQSBjdXN0b20gc2FuaXRpemVyIGluc3RhbmNlICovXG4gIHNhbml0aXplcj86IFNhbml0aXplcjtcblxuICAvKiogQSBjdXN0b20gYW5pbWF0aW9uIHBsYXllciBoYW5kbGVyICovXG4gIHBsYXllckhhbmRsZXI/OiBQbGF5ZXJIYW5kbGVyO1xuXG4gIC8qKlxuICAgKiBIb3N0IGVsZW1lbnQgb24gd2hpY2ggdGhlIGNvbXBvbmVudCB3aWxsIGJlIGJvb3RzdHJhcHBlZC4gSWYgbm90IHNwZWNpZmllZCxcbiAgICogdGhlIGNvbXBvbmVudCBkZWZpbml0aW9uJ3MgYHRhZ2AgaXMgdXNlZCB0byBxdWVyeSB0aGUgZXhpc3RpbmcgRE9NIGZvciB0aGVcbiAgICogZWxlbWVudCB0byBib290c3RyYXAuXG4gICAqL1xuICBob3N0PzogUkVsZW1lbnR8c3RyaW5nO1xuXG4gIC8qKiBNb2R1bGUgaW5qZWN0b3IgZm9yIHRoZSBjb21wb25lbnQuIElmIHVuc3BlY2lmaWVkLCB0aGUgaW5qZWN0b3Igd2lsbCBiZSBOVUxMX0lOSkVDVE9SLiAqL1xuICBpbmplY3Rvcj86IEluamVjdG9yO1xuXG4gIC8qKlxuICAgKiBMaXN0IG9mIGZlYXR1cmVzIHRvIGJlIGFwcGxpZWQgdG8gdGhlIGNyZWF0ZWQgY29tcG9uZW50LiBGZWF0dXJlcyBhcmUgc2ltcGx5XG4gICAqIGZ1bmN0aW9ucyB0aGF0IGRlY29yYXRlIGEgY29tcG9uZW50IHdpdGggYSBjZXJ0YWluIGJlaGF2aW9yLlxuICAgKlxuICAgKiBUeXBpY2FsbHksIHRoZSBmZWF0dXJlcyBpbiB0aGlzIGxpc3QgYXJlIGZlYXR1cmVzIHRoYXQgY2Fubm90IGJlIGFkZGVkIHRvIHRoZVxuICAgKiBvdGhlciBmZWF0dXJlcyBsaXN0IGluIHRoZSBjb21wb25lbnQgZGVmaW5pdGlvbiBiZWNhdXNlIHRoZXkgcmVseSBvbiBvdGhlciBmYWN0b3JzLlxuICAgKlxuICAgKiBFeGFtcGxlOiBgUm9vdExpZmVjeWNsZUhvb2tzYCBpcyBhIGZ1bmN0aW9uIHRoYXQgYWRkcyBsaWZlY3ljbGUgaG9vayBjYXBhYmlsaXRpZXNcbiAgICogdG8gcm9vdCBjb21wb25lbnRzIGluIGEgdHJlZS1zaGFrYWJsZSB3YXkuIEl0IGNhbm5vdCBiZSBhZGRlZCB0byB0aGUgY29tcG9uZW50XG4gICAqIGZlYXR1cmVzIGxpc3QgYmVjYXVzZSB0aGVyZSdzIG5vIHdheSBvZiBrbm93aW5nIHdoZW4gdGhlIGNvbXBvbmVudCB3aWxsIGJlIHVzZWQgYXNcbiAgICogYSByb290IGNvbXBvbmVudC5cbiAgICovXG4gIGhvc3RGZWF0dXJlcz86IEhvc3RGZWF0dXJlW107XG5cbiAgLyoqXG4gICAqIEEgZnVuY3Rpb24gd2hpY2ggaXMgdXNlZCB0byBzY2hlZHVsZSBjaGFuZ2UgZGV0ZWN0aW9uIHdvcmsgaW4gdGhlIGZ1dHVyZS5cbiAgICpcbiAgICogV2hlbiBtYXJraW5nIGNvbXBvbmVudHMgYXMgZGlydHksIGl0IGlzIG5lY2Vzc2FyeSB0byBzY2hlZHVsZSB0aGUgd29yayBvZlxuICAgKiBjaGFuZ2UgZGV0ZWN0aW9uIGluIHRoZSBmdXR1cmUuIFRoaXMgaXMgZG9uZSB0byBjb2FsZXNjZSBtdWx0aXBsZVxuICAgKiB7QGxpbmsgbWFya0RpcnR5fSBjYWxscyBpbnRvIGEgc2luZ2xlIGNoYW5nZWQgZGV0ZWN0aW9uIHByb2Nlc3NpbmcuXG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IHZhbHVlIG9mIHRoZSBzY2hlZHVsZXIgaXMgdGhlIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBJdCBpcyBhbHNvIHVzZWZ1bCB0byBvdmVycmlkZSB0aGlzIGZ1bmN0aW9uIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxuICAgKi9cbiAgc2NoZWR1bGVyPzogKHdvcms6ICgpID0+IHZvaWQpID0+IHZvaWQ7XG59XG5cbi8qKiBTZWUgQ3JlYXRlQ29tcG9uZW50T3B0aW9ucy5ob3N0RmVhdHVyZXMgKi9cbnR5cGUgSG9zdEZlYXR1cmUgPSAoPFQ+KGNvbXBvbmVudDogVCwgY29tcG9uZW50RGVmOiBDb21wb25lbnREZWY8VD4pID0+IHZvaWQpO1xuXG4vLyBUT0RPOiBBIGhhY2sgdG8gbm90IHB1bGwgaW4gdGhlIE51bGxJbmplY3RvciBmcm9tIEBhbmd1bGFyL2NvcmUuXG5leHBvcnQgY29uc3QgTlVMTF9JTkpFQ1RPUjogSW5qZWN0b3IgPSB7XG4gIGdldDogKHRva2VuOiBhbnksIG5vdEZvdW5kVmFsdWU/OiBhbnkpID0+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ051bGxJbmplY3RvcjogTm90IGZvdW5kOiAnICsgc3RyaW5naWZ5KHRva2VuKSk7XG4gIH1cbn07XG5cbi8qKlxuICogQm9vdHN0cmFwcyBhIENvbXBvbmVudCBpbnRvIGFuIGV4aXN0aW5nIGhvc3QgZWxlbWVudCBhbmQgcmV0dXJucyBhbiBpbnN0YW5jZVxuICogb2YgdGhlIGNvbXBvbmVudC5cbiAqXG4gKiBVc2UgdGhpcyBmdW5jdGlvbiB0byBib290c3RyYXAgYSBjb21wb25lbnQgaW50byB0aGUgRE9NIHRyZWUuIEVhY2ggaW52b2NhdGlvblxuICogb2YgdGhpcyBmdW5jdGlvbiB3aWxsIGNyZWF0ZSBhIHNlcGFyYXRlIHRyZWUgb2YgY29tcG9uZW50cywgaW5qZWN0b3JzIGFuZFxuICogY2hhbmdlIGRldGVjdGlvbiBjeWNsZXMgYW5kIGxpZmV0aW1lcy4gVG8gZHluYW1pY2FsbHkgaW5zZXJ0IGEgbmV3IGNvbXBvbmVudFxuICogaW50byBhbiBleGlzdGluZyB0cmVlIHN1Y2ggdGhhdCBpdCBzaGFyZXMgdGhlIHNhbWUgaW5qZWN0aW9uLCBjaGFuZ2UgZGV0ZWN0aW9uXG4gKiBhbmQgb2JqZWN0IGxpZmV0aW1lLCB1c2Uge0BsaW5rIFZpZXdDb250YWluZXIjY3JlYXRlQ29tcG9uZW50fS5cbiAqXG4gKiBAcGFyYW0gY29tcG9uZW50VHlwZSBDb21wb25lbnQgdG8gYm9vdHN0cmFwXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25hbCBwYXJhbWV0ZXJzIHdoaWNoIGNvbnRyb2wgYm9vdHN0cmFwcGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQ29tcG9uZW50PFQ+KFxuICAgIGNvbXBvbmVudFR5cGU6IENvbXBvbmVudFR5cGU8VD58XG4gICAgICAgIFR5cGU8VD4vKiBUeXBlIGFzIHdvcmthcm91bmQgZm9yOiBNaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNDg4MSAqL1xuICAgICxcbiAgICBvcHRzOiBDcmVhdGVDb21wb25lbnRPcHRpb25zID0ge30pOiBUIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydENvbXBvbmVudFR5cGUoY29tcG9uZW50VHlwZSk7XG4gIGNvbnN0IHJlbmRlcmVyRmFjdG9yeSA9IG9wdHMucmVuZGVyZXJGYWN0b3J5IHx8IGRvbVJlbmRlcmVyRmFjdG9yeTM7XG4gIGNvbnN0IHNhbml0aXplciA9IG9wdHMuc2FuaXRpemVyIHx8IG51bGw7XG4gIGNvbnN0IGNvbXBvbmVudERlZiA9IGdldENvbXBvbmVudERlZjxUPihjb21wb25lbnRUeXBlKSAhO1xuICBpZiAoY29tcG9uZW50RGVmLnR5cGUgIT0gY29tcG9uZW50VHlwZSkgY29tcG9uZW50RGVmLnR5cGUgPSBjb21wb25lbnRUeXBlO1xuXG4gIC8vIFRoZSBmaXJzdCBpbmRleCBvZiB0aGUgZmlyc3Qgc2VsZWN0b3IgaXMgdGhlIHRhZyBuYW1lLlxuICBjb25zdCBjb21wb25lbnRUYWcgPSBjb21wb25lbnREZWYuc2VsZWN0b3JzICFbMF0gIVswXSBhcyBzdHJpbmc7XG4gIGNvbnN0IGhvc3RSTm9kZSA9IGxvY2F0ZUhvc3RFbGVtZW50KHJlbmRlcmVyRmFjdG9yeSwgb3B0cy5ob3N0IHx8IGNvbXBvbmVudFRhZyk7XG4gIGNvbnN0IHJvb3RGbGFncyA9IGNvbXBvbmVudERlZi5vblB1c2ggPyBMVmlld0ZsYWdzLkRpcnR5IHwgTFZpZXdGbGFncy5Jc1Jvb3QgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTFZpZXdGbGFncy5DaGVja0Fsd2F5cyB8IExWaWV3RmxhZ3MuSXNSb290O1xuICBjb25zdCByb290Q29udGV4dCA9IGNyZWF0ZVJvb3RDb250ZXh0KFxuICAgICAgb3B0cy5zY2hlZHVsZXIgfHwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLmJpbmQod2luZG93KSwgb3B0cy5wbGF5ZXJIYW5kbGVyIHx8IG51bGwpO1xuXG4gIGNvbnN0IHJlbmRlcmVyID0gcmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVJlbmRlcmVyKGhvc3RSTm9kZSwgY29tcG9uZW50RGVmKTtcbiAgY29uc3Qgcm9vdFZpZXc6IExWaWV3RGF0YSA9IGNyZWF0ZUxWaWV3RGF0YShcbiAgICAgIHJlbmRlcmVyLCBjcmVhdGVUVmlldygtMSwgbnVsbCwgMSwgMCwgbnVsbCwgbnVsbCwgbnVsbCksIHJvb3RDb250ZXh0LCByb290RmxhZ3MpO1xuICByb290Vmlld1tJTkpFQ1RPUl0gPSBvcHRzLmluamVjdG9yIHx8IG51bGw7XG5cbiAgY29uc3Qgb2xkVmlldyA9IGVudGVyVmlldyhyb290VmlldywgbnVsbCk7XG4gIGxldCBjb21wb25lbnQ6IFQ7XG4gIHRyeSB7XG4gICAgaWYgKHJlbmRlcmVyRmFjdG9yeS5iZWdpbikgcmVuZGVyZXJGYWN0b3J5LmJlZ2luKCk7XG5cbiAgICBjb25zdCBjb21wb25lbnRWaWV3ID1cbiAgICAgICAgY3JlYXRlUm9vdENvbXBvbmVudFZpZXcoaG9zdFJOb2RlLCBjb21wb25lbnREZWYsIHJvb3RWaWV3LCByZW5kZXJlciwgc2FuaXRpemVyKTtcbiAgICBjb21wb25lbnQgPSBjcmVhdGVSb290Q29tcG9uZW50KFxuICAgICAgICBob3N0Uk5vZGUsIGNvbXBvbmVudFZpZXcsIGNvbXBvbmVudERlZiwgcm9vdFZpZXcsIHJvb3RDb250ZXh0LCBvcHRzLmhvc3RGZWF0dXJlcyB8fCBudWxsKTtcblxuICAgIGV4ZWN1dGVJbml0QW5kQ29udGVudEhvb2tzKCk7XG4gICAgZGV0ZWN0Q2hhbmdlc0ludGVybmFsKGNvbXBvbmVudFZpZXcsIGNvbXBvbmVudCk7XG4gIH0gZmluYWxseSB7XG4gICAgbGVhdmVWaWV3KG9sZFZpZXcpO1xuICAgIGlmIChyZW5kZXJlckZhY3RvcnkuZW5kKSByZW5kZXJlckZhY3RvcnkuZW5kKCk7XG4gIH1cblxuICByZXR1cm4gY29tcG9uZW50O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgdGhlIHJvb3QgY29tcG9uZW50IHZpZXcgYW5kIHRoZSByb290IGNvbXBvbmVudCBub2RlLlxuICpcbiAqIEBwYXJhbSByTm9kZSBSZW5kZXIgaG9zdCBlbGVtZW50LlxuICogQHBhcmFtIGRlZiBDb21wb25lbnREZWZcbiAqIEBwYXJhbSByb290VmlldyBUaGUgcGFyZW50IHZpZXcgd2hlcmUgdGhlIGhvc3Qgbm9kZSBpcyBzdG9yZWRcbiAqIEBwYXJhbSByZW5kZXJlciBUaGUgY3VycmVudCByZW5kZXJlclxuICogQHBhcmFtIHNhbml0aXplciBUaGUgc2FuaXRpemVyLCBpZiBwcm92aWRlZFxuICpcbiAqIEByZXR1cm5zIENvbXBvbmVudCB2aWV3IGNyZWF0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJvb3RDb21wb25lbnRWaWV3KFxuICAgIHJOb2RlOiBSRWxlbWVudCB8IG51bGwsIGRlZjogQ29tcG9uZW50RGVmPGFueT4sIHJvb3RWaWV3OiBMVmlld0RhdGEsIHJlbmRlcmVyOiBSZW5kZXJlcjMsXG4gICAgc2FuaXRpemVyPzogU2FuaXRpemVyIHwgbnVsbCk6IExWaWV3RGF0YSB7XG4gIHJlc2V0Q29tcG9uZW50U3RhdGUoKTtcbiAgY29uc3QgdFZpZXcgPSByb290Vmlld1tUVklFV107XG4gIGNvbnN0IGNvbXBvbmVudFZpZXcgPSBjcmVhdGVMVmlld0RhdGEoXG4gICAgICByZW5kZXJlcixcbiAgICAgIGdldE9yQ3JlYXRlVFZpZXcoXG4gICAgICAgICAgZGVmLnRlbXBsYXRlLCBkZWYuY29uc3RzLCBkZWYudmFycywgZGVmLmRpcmVjdGl2ZURlZnMsIGRlZi5waXBlRGVmcywgZGVmLnZpZXdRdWVyeSksXG4gICAgICBudWxsLCBkZWYub25QdXNoID8gTFZpZXdGbGFncy5EaXJ0eSA6IExWaWV3RmxhZ3MuQ2hlY2tBbHdheXMsIHNhbml0aXplcik7XG4gIGNvbnN0IHROb2RlID0gY3JlYXRlTm9kZUF0SW5kZXgoMCwgVE5vZGVUeXBlLkVsZW1lbnQsIHJOb2RlLCBudWxsLCBudWxsKTtcblxuICBpZiAodFZpZXcuZmlyc3RUZW1wbGF0ZVBhc3MpIHtcbiAgICB0Vmlldy5leHBhbmRvSW5zdHJ1Y3Rpb25zID0gUk9PVF9FWFBBTkRPX0lOU1RSVUNUSU9OUy5zbGljZSgpO1xuICAgIGlmIChkZWYuZGlQdWJsaWMpIGRlZi5kaVB1YmxpYyhkZWYpO1xuICAgIHROb2RlLmZsYWdzID1cbiAgICAgICAgcm9vdFZpZXcubGVuZ3RoIDw8IFROb2RlRmxhZ3MuRGlyZWN0aXZlU3RhcnRpbmdJbmRleFNoaWZ0IHwgVE5vZGVGbGFncy5pc0NvbXBvbmVudDtcbiAgfVxuXG4gIC8vIFN0b3JlIGNvbXBvbmVudCB2aWV3IGF0IG5vZGUgaW5kZXgsIHdpdGggbm9kZSBhcyB0aGUgSE9TVFxuICBjb21wb25lbnRWaWV3W0hPU1RdID0gcm9vdFZpZXdbSEVBREVSX09GRlNFVF07XG4gIGNvbXBvbmVudFZpZXdbSE9TVF9OT0RFXSA9IHROb2RlIGFzIFRFbGVtZW50Tm9kZTtcbiAgcmV0dXJuIHJvb3RWaWV3W0hFQURFUl9PRkZTRVRdID0gY29tcG9uZW50Vmlldztcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgcm9vdCBjb21wb25lbnQgYW5kIHNldHMgaXQgdXAgd2l0aCBmZWF0dXJlcyBhbmQgaG9zdCBiaW5kaW5ncy4gU2hhcmVkIGJ5XG4gKiByZW5kZXJDb21wb25lbnQoKSBhbmQgVmlld0NvbnRhaW5lclJlZi5jcmVhdGVDb21wb25lbnQoKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJvb3RDb21wb25lbnQ8VD4oXG4gICAgaG9zdFJOb2RlOiBSTm9kZSB8IG51bGwsIGNvbXBvbmVudFZpZXc6IExWaWV3RGF0YSwgY29tcG9uZW50RGVmOiBDb21wb25lbnREZWY8VD4sXG4gICAgcm9vdFZpZXc6IExWaWV3RGF0YSwgcm9vdENvbnRleHQ6IFJvb3RDb250ZXh0LCBob3N0RmVhdHVyZXM6IEhvc3RGZWF0dXJlW10gfCBudWxsKTogYW55IHtcbiAgLy8gQ3JlYXRlIGRpcmVjdGl2ZSBpbnN0YW5jZSB3aXRoIGZhY3RvcnkoKSBhbmQgc3RvcmUgYXQgbmV4dCBpbmRleCBpbiB2aWV3RGF0YVxuICBjb25zdCBjb21wb25lbnQgPVxuICAgICAgYmFzZURpcmVjdGl2ZUNyZWF0ZShyb290Vmlldy5sZW5ndGgsIGNvbXBvbmVudERlZi5mYWN0b3J5KCkgYXMgVCwgY29tcG9uZW50RGVmLCBob3N0Uk5vZGUpO1xuXG4gIHJvb3RDb250ZXh0LmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICBjb21wb25lbnRWaWV3W0NPTlRFWFRdID0gY29tcG9uZW50O1xuXG4gIGhvc3RGZWF0dXJlcyAmJiBob3N0RmVhdHVyZXMuZm9yRWFjaCgoZmVhdHVyZSkgPT4gZmVhdHVyZShjb21wb25lbnQsIGNvbXBvbmVudERlZikpO1xuICBpZiAocm9vdFZpZXdbVFZJRVddLmZpcnN0VGVtcGxhdGVQYXNzKSBwcmVmaWxsSG9zdFZhcnMoY29tcG9uZW50RGVmLmhvc3RWYXJzKTtcbiAgc2V0SG9zdEJpbmRpbmdzKCk7XG4gIHJldHVybiBjb21wb25lbnQ7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJvb3RDb250ZXh0KFxuICAgIHNjaGVkdWxlcjogKHdvcmtGbjogKCkgPT4gdm9pZCkgPT4gdm9pZCwgcGxheWVySGFuZGxlcj86IFBsYXllckhhbmRsZXJ8bnVsbCk6IFJvb3RDb250ZXh0IHtcbiAgcmV0dXJuIHtcbiAgICBjb21wb25lbnRzOiBbXSxcbiAgICBzY2hlZHVsZXI6IHNjaGVkdWxlcixcbiAgICBjbGVhbjogQ0xFQU5fUFJPTUlTRSxcbiAgICBwbGF5ZXJIYW5kbGVyOiBwbGF5ZXJIYW5kbGVyIHx8IG51bGwsXG4gICAgZmxhZ3M6IFJvb3RDb250ZXh0RmxhZ3MuRW1wdHlcbiAgfTtcbn1cblxuLyoqXG4gKiBVc2VkIHRvIGVuYWJsZSBsaWZlY3ljbGUgaG9va3Mgb24gdGhlIHJvb3QgY29tcG9uZW50LlxuICpcbiAqIEluY2x1ZGUgdGhpcyBmZWF0dXJlIHdoZW4gY2FsbGluZyBgcmVuZGVyQ29tcG9uZW50YCBpZiB0aGUgcm9vdCBjb21wb25lbnRcbiAqIHlvdSBhcmUgcmVuZGVyaW5nIGhhcyBsaWZlY3ljbGUgaG9va3MgZGVmaW5lZC4gT3RoZXJ3aXNlLCB0aGUgaG9va3Mgd29uJ3RcbiAqIGJlIGNhbGxlZCBwcm9wZXJseS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYFxuICogcmVuZGVyQ29tcG9uZW50KEFwcENvbXBvbmVudCwge2ZlYXR1cmVzOiBbUm9vdExpZmVjeWNsZUhvb2tzXX0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMaWZlY3ljbGVIb29rc0ZlYXR1cmUoY29tcG9uZW50OiBhbnksIGRlZjogQ29tcG9uZW50RGVmPGFueT4pOiB2b2lkIHtcbiAgY29uc3Qgcm9vdFRWaWV3ID0gcmVhZFBhdGNoZWRMVmlld0RhdGEoY29tcG9uZW50KSAhW1RWSUVXXTtcbiAgY29uc3QgZGlySW5kZXggPSByb290VFZpZXcuZGF0YS5sZW5ndGggLSAxO1xuXG4gIHF1ZXVlSW5pdEhvb2tzKGRpckluZGV4LCBkZWYub25Jbml0LCBkZWYuZG9DaGVjaywgcm9vdFRWaWV3KTtcbiAgcXVldWVMaWZlY3ljbGVIb29rcyhkaXJJbmRleCA8PCBUTm9kZUZsYWdzLkRpcmVjdGl2ZVN0YXJ0aW5nSW5kZXhTaGlmdCB8IDEsIHJvb3RUVmlldyk7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIHJvb3QgY29udGV4dCBmb3IgYW55IGNvbXBvbmVudCBieSB3YWxraW5nIHRoZSBwYXJlbnQgYExWaWV3YCB1bnRpbFxuICogcmVhY2hpbmcgdGhlIHJvb3QgYExWaWV3YC5cbiAqXG4gKiBAcGFyYW0gY29tcG9uZW50IGFueSBjb21wb25lbnRcbiAqL1xuZnVuY3Rpb24gZ2V0Um9vdENvbnRleHQoY29tcG9uZW50OiBhbnkpOiBSb290Q29udGV4dCB7XG4gIGNvbnN0IHJvb3RDb250ZXh0ID0gZ2V0Um9vdFZpZXcoY29tcG9uZW50KVtDT05URVhUXSBhcyBSb290Q29udGV4dDtcbiAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQocm9vdENvbnRleHQsICdyb290Q29udGV4dCcpO1xuICByZXR1cm4gcm9vdENvbnRleHQ7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGhvc3QgZWxlbWVudCBvZiB0aGUgY29tcG9uZW50LlxuICpcbiAqIFVzZSB0aGlzIGZ1bmN0aW9uIHRvIHJldHJpZXZlIHRoZSBob3N0IGVsZW1lbnQgb2YgdGhlIGNvbXBvbmVudC4gVGhlIGhvc3RcbiAqIGVsZW1lbnQgaXMgdGhlIGVsZW1lbnQgd2hpY2ggdGhlIGNvbXBvbmVudCBpcyBhc3NvY2lhdGVkIHdpdGguXG4gKlxuICogQHBhcmFtIGNvbXBvbmVudCBDb21wb25lbnQgZm9yIHdoaWNoIHRoZSBob3N0IGVsZW1lbnQgc2hvdWxkIGJlIHJldHJpZXZlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEhvc3RFbGVtZW50PFQ+KGNvbXBvbmVudDogVCk6IEhUTUxFbGVtZW50IHtcbiAgcmV0dXJuIHJlYWRFbGVtZW50VmFsdWUoZ2V0Q29tcG9uZW50Vmlld0J5SW5zdGFuY2UoY29tcG9uZW50KSkgYXMgSFRNTEVsZW1lbnQ7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSByZW5kZXJlZCB0ZXh0IGZvciBhIGdpdmVuIGNvbXBvbmVudC5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHJldHJpZXZlcyB0aGUgaG9zdCBlbGVtZW50IG9mIGEgY29tcG9uZW50IGFuZFxuICogYW5kIHRoZW4gcmV0dXJucyB0aGUgYHRleHRDb250ZW50YCBmb3IgdGhhdCBlbGVtZW50LiBUaGlzIGltcGxpZXNcbiAqIHRoYXQgdGhlIHRleHQgcmV0dXJuZWQgd2lsbCBpbmNsdWRlIHJlLXByb2plY3RlZCBjb250ZW50IG9mXG4gKiB0aGUgY29tcG9uZW50IGFzIHdlbGwuXG4gKlxuICogQHBhcmFtIGNvbXBvbmVudCBUaGUgY29tcG9uZW50IHRvIHJldHVybiB0aGUgY29udGVudCB0ZXh0IGZvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlbmRlcmVkVGV4dChjb21wb25lbnQ6IGFueSk6IHN0cmluZyB7XG4gIGNvbnN0IGhvc3RFbGVtZW50ID0gZ2V0SG9zdEVsZW1lbnQoY29tcG9uZW50KTtcbiAgcmV0dXJuIGhvc3RFbGVtZW50LnRleHRDb250ZW50IHx8ICcnO1xufVxuXG4vKipcbiAqIFdhaXQgb24gY29tcG9uZW50IHVudGlsIGl0IGlzIHJlbmRlcmVkLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIGBQcm9taXNlYCB3aGljaCBpcyByZXNvbHZlZCB3aGVuIHRoZSBjb21wb25lbnQnc1xuICogY2hhbmdlIGRldGVjdGlvbiBpcyBleGVjdXRlZC4gVGhpcyBpcyBkZXRlcm1pbmVkIGJ5IGZpbmRpbmcgdGhlIHNjaGVkdWxlclxuICogYXNzb2NpYXRlZCB3aXRoIHRoZSBgY29tcG9uZW50YCdzIHJlbmRlciB0cmVlIGFuZCB3YWl0aW5nIHVudGlsIHRoZSBzY2hlZHVsZXJcbiAqIGZsdXNoZXMuIElmIG5vdGhpbmcgaXMgc2NoZWR1bGVkLCB0aGUgZnVuY3Rpb24gcmV0dXJucyBhIHJlc29sdmVkIHByb21pc2UuXG4gKlxuICogRXhhbXBsZTpcbiAqIGBgYFxuICogYXdhaXQgd2hlblJlbmRlcmVkKG15Q29tcG9uZW50KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBjb21wb25lbnQgQ29tcG9uZW50IHRvIHdhaXQgdXBvblxuICogQHJldHVybnMgUHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aGVuIHRoZSBjb21wb25lbnQgaXMgcmVuZGVyZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aGVuUmVuZGVyZWQoY29tcG9uZW50OiBhbnkpOiBQcm9taXNlPG51bGw+IHtcbiAgcmV0dXJuIGdldFJvb3RDb250ZXh0KGNvbXBvbmVudCkuY2xlYW47XG59XG4iXX0=