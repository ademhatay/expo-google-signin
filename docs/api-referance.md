Module API Reference


Copy

An API reference of Expo modules API.

The native modules API is an abstraction layer on top of JSI and other low-level primitives that React Native is built upon. It is built with modern languages (Swift and Kotlin) and provides an easy-to-use and convenient API that is consistent across platforms where possible.

Definition components
As you might have noticed in the snippets on the Get Started page, each module class must implement the definition function. The module definition consists of the DSL components that describe the module's functionality and behavior.

Name
Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument. This can be inferred from the module's class name, but it's recommended to set it explicitly for clarity.

Swift / Kotlin

Copy


Name("MyModuleName")
Constant
Defines a constant property on the JavaScript object. The property is computed only once when it's first accessed, and subsequent accesses return the cached value.

Swift

Copy

Constant("PI") {
  Double.pi
}
Kotlin

Copy

Constant("PI") {
  Math.PI
}
Function
Defines a native synchronous function that will be exported to JavaScript. Synchronous means that when the function is executed in JavaScript, its native code is run on the same thread and blocks further execution of the script until the native function returns.

Arguments
name: String — Name of the function that you'll call from JavaScript.
body: (args...) -> ReturnType — The closure to run when the function is called.
The function can receive up to 8 arguments. This is due to the limitations of generics in both Swift and Kotlin because this component must be implemented separately for each arity.

See the Argument types section for more details on what types can be used in the function body.

Swift

Copy

Function("mySyncFunction") { (message: String) in
  return message
}
Kotlin

Copy

Function("mySyncFunction") { message: String ->
  return@Function message
}
JavaScript

Copy


import { requireNativeModule } from 'expo-modules-core';

// Assume that we have named the module "MyModule"
const MyModule = requireNativeModule('MyModule');

function getMessage() {
  return MyModule.mySyncFunction('bar');
}
AsyncFunction
Defines a JavaScript function that always returns a Promise and whose native code is by default dispatched on a different thread than the JavaScript runtime runs on.

Arguments
name: String — Name of the function that you'll call from JavaScript.
body: (args...) -> ReturnType — The closure to run when the function is called.
If the type of the last argument is Promise, the function will wait for the promise to be resolved or rejected before the response is passed back to JavaScript. Otherwise, the function is immediately resolved with the returned value or rejected if it throws an exception. The function can receive up to 8 arguments (including the promise).

See the Argument types section for more details on what types can be used in the function body.

It is recommended to use AsyncFunction over Function when it:

does I/O bound tasks such as sending network requests or interacting with the file system
needs to be run on a different thread, for example, the main UI thread for UI-related tasks
is an extensive or long-lasting operation that would block the JavaScript thread which in turn would reduce the responsiveness of the application
Swift

Copy

AsyncFunction("myAsyncFunction") { (message: String) in
  return message
}

// or

AsyncFunction("myAsyncFunction") { (message: String, promise: Promise) in
  promise.resolve(message)
}

Kotlin

Copy

AsyncFunction("myAsyncFunction") { message: String ->
  return@AsyncFunction message
}

// or

// Make sure to import `Promise` class from `expo.modules.kotlin` instead of `expo.modules.core`.
AsyncFunction("myAsyncFunction") { message: String, promise: Promise ->
  promise.resolve(message)
}

JavaScript

Copy


import { requireNativeModule } from 'expo-modules-core';

// Assume that we have named the module "MyModule"
const MyModule = requireNativeModule('MyModule');

async function getMessageAsync() {
  return await MyModule.myAsyncFunction('bar');
}
It is possible to change the native queue of AsyncFunction by calling the .runOnQueue function on the result of that component.

Swift

Copy

AsyncFunction("myAsyncFunction") { (message: String) in
  return message
}.runOnQueue(.main)
Kotlin

Copy

AsyncFunction("myAsyncFunction") { message: String ->
  return@AsyncFunction message
}.runOnQueue(Queues.MAIN)
Kotlin coroutines 
AsyncFunction can receive a suspendable body on Android. However, it has to be passed in the infix notation after the Coroutine block. You can read more about suspendable functions and coroutines on coroutine overview.

AsyncFunction with a suspendable body can't receive Promise as an argument. It uses a suspension mechanism to execute asynchronous calls. The function is immediately resolved with the returned value of the provided suspendable block or rejected if it throws an exception. The function can receive up to 8 arguments.

By default, suspend functions are dispatched on the module's coroutine scope. Moreover, every other suspendable function called from the body block is run within the same scope. This scope's lifecycle is bound to the module's lifecycle - all unfinished suspend functions will be canceled when the module is deallocated.

Kotlin

Copy


AsyncFunction("suspendFunction") Coroutine { message: String ->
  // You can execute other suspendable functions here.
  // For example, you can use `kotlinx.coroutines.delay` to delay resolving the underlying promise.
  delay(5000)
  return@Coroutine message
}
Events
Defines event names that the module can send to JavaScript.

Note: This component can be used inside of the View block to define callback names. See View callbacks

Swift

Copy

Events("onCameraReady", "onPictureSaved", "onBarCodeScanned")
Kotlin

Copy

Events("onCameraReady", "onPictureSaved", "onBarCodeScanned")
See Sending events to learn how to send events from the native code to JavaScript/TypeScript.

Property
Defines a new property directly on the JavaScript object that represents a native module. It is the same as calling Object.defineProperty on the module object.

To declare a read-only property, you can use a shorthanded syntax that requires two arguments:

name: String — Name of the property that you'll use from JavaScript.
getter: () -> PropertyType — The closure to run when the getter for a property was called.
Swift

Copy

Property("foo") {
  return "bar"
}
Kotlin

Copy

Property("foo") {
  return@Property "bar"
}
In the case of the mutable property, both the getter and the setter closure are needed (using the syntax below is also possible to declare a property with only a setter):

name: String — Name of the property that you'll use from JavaScript.
getter: () -> PropertyType — The closure to run when the getter for a property was called.
setter: (newValue: PropertyType) -> void — The closure to run when the setter for a property was called.
Swift

Copy

Property("foo")
  .get { return "bar" }
  .set { (newValue: String) in
    // do something with new value
  }
Kotlin

Copy

Property("foo")
  .get { return@get "bar" }
  .set { newValue: String ->
    // do something with new value
  }
JavaScript

Copy


import { requireNativeModule } from 'expo-modules-core';

// Assume that we have named the module "MyModule"
const MyModule = requireNativeModule('MyModule');

// Obtain the property value
MyModule.foo;

// Set a new value
MyModule.foo = 'foobar';
View
Enables the module to be used as a native view. Definition components that are accepted as part of the view definition: Prop, Events, GroupView and AsyncFunction.

AsyncFunction in the view definition is added to the React ref of the React component representing the native view. Such async functions automatically receive an instance of the native view as the first argument and run on the UI thread by default.

Arguments
viewType — The class of the native view that will be rendered. Note: On Android, the provided class must inherit from the ExpoView, on iOS it's optional. See Extending ExpoView.
definition: () -> ViewDefinition — A builder of the view definition.
Swift

Copy

View(UITextView.self) {
  Prop("text") { ...  }

  AsyncFunction("focus") { (view: UITextView) in
    view.becomeFirstResponder()
  }
}
Kotlin

Copy

View(TextView::class) {
  Prop("text") { ...  }

  AsyncFunction("focus") { view: TextView ->
    view.requestFocus()
  }
}
Support for rendering SwiftUI views is planned. For now, you can use UIHostingController and add its content view to your UIKit view.
OnCreate
Defines module's lifecycle listener that is called right after module initialization. If you need to set up something when the module gets initialized, use this instead of module's class initializer.

OnDestroy
Defines module's lifecycle listener that is called when the module is about to be deallocated. Use it instead of module's class destructor.

OnStartObserving
Defines the function that is invoked when the first event listener is added.

OnStopObserving
Defines the function that is invoked when all event listeners are removed.

OnAppContextDestroys
Defines module's lifecycle listener that is called when the app context owning the module is about to be deallocated.

OnAppEntersForeground
Only for: 

Defines the listener that is called when the app is about to enter the foreground mode.

Note: This function is not available on Android — you may want to use OnActivityEntersForeground instead.

OnAppEntersBackground
Only for: 

Defines the listener that is called when the app enters the background mode.

Note: This function is not available on Android — you may want to use OnActivityEntersBackground instead.

OnAppBecomesActive
Only for: 

Defines the listener that is called when the app becomes active again (after OnAppEntersForeground).

Note: This function is not available on Android — you may want to use OnActivityEntersForeground instead.

OnActivityEntersForeground
Only for: 

Defines the activity lifecycle listener that is called right after the activity is resumed.

Note: This function is not available on iOS — you may want to use OnAppEntersForeground instead.

OnActivityEntersBackground
Only for: 

Defines the activity lifecycle listener that is called right after the activity is paused.

Note: This function is not available on iOS — you may want to use OnAppEntersBackground instead.

OnActivityDestroys
Only for: 

Defines the activity lifecycle listener that is called when the activity owning the JavaScript context is about to be destroyed.

Note: This function is not available on iOS — you may want to use OnAppEntersBackground instead.

OnActivityResult
Only for: 

Defines the activity lifecycle listener that is called when the activity launched with startActivityForResult returns a result.

Arguments
activity — The Android activity that received the result.
payload — An object containing data about the activity result.
requestCode: Int — The request code originally supplied to startActivityForResult, used to identify the source of the result.
resultCode: Int — The result code returned by the child activity (for example, Activity.RESULT_OK or Activity.RESULT_CANCELED).
data — An optional intent that carries the result data returned from the launched activity. Can be null.
Kotlin

Copy


AsyncFunction('someFunc') {
  ... 
  activity.startActivityForResult(someIntent, SOME_REQUEST_CODE)
}

OnActivityResult { activity, payload ->
  ... 
}
Constants
Deprecated: Use Constant instead.
Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.

Swift

Copy

// Created from the dictionary
Constants([
  "PI": Double.pi
])

// or returned by the closure
Constants {
  return [
    "PI": Double.pi
  ]
}
Kotlin

Copy

// Passed as arguments
Constants(
  "PI" to kotlin.math.PI
)

// or returned by the closure
Constants {
  return@Constants mapOf(
    "PI" to kotlin.math.PI
  )
}
View definition components
The view definition consists of the DSL components that describe the view's functionality and behavior. Those components can only be used within a View closure.

Name
Sets the name of the view that JavaScript code will use to refer to the view. Takes a string as an argument. This can be inferred from the view's class name, but it's recommended to set it explicitly for clarity.

Swift / Kotlin

Copy


Name("MyViewName")
Prop
Defines a setter for the view prop of given name.

Arguments
name: String — Name of view prop that you want to define a setter.
defaultValue: ValueType — Optional default value used when the setter is called with null.
setter: (view: ViewType, value: ValueType) -> () — Closure that is invoked when the view rerenders.
This property can only be used within a View closure.

Swift

Copy

Prop("background") { (view: UIView, color: UIColor) in
  view.backgroundColor = color
}
Kotlin

Copy

Prop("background") { view: View, @ColorInt color: Int ->
  view.setBackgroundColor(color)
}
Prop definition with default value.

Swift

Copy

Prop("background", UIColor.black) { (view: UIView, color: UIColor) in
  view.backgroundColor = color
}
Kotlin

Copy

Prop("background", Color.BLACK) { view: View, @ColorInt color: Int ->
  view.setBackgroundColor(color)
}
Note: Props of function type (callbacks) are not supported yet.

OnViewDidUpdateProps
Defines the view lifecycle method that is called when the view finished updating all props.

View(MyView.self) {
  OnViewDidUpdateProps { view: MyView in
    ... 
  }
}
View(MyView::class) {
  OnViewDidUpdateProps { view: MyView ->
    ... 
  }
}
(View) AsyncFunction
Similarly to the AsyncFunction inside the module definition, you can define functions attached to the view ref to allow direct modification of the native view.

View async functions will always be dispatched on the main queue and can receive the view instance as the first argument.

Swift

Copy

View(MyView.self) {
  AsyncFunction("myAsyncFunction") { (view: MyView, message: String) in
    view.displayMessage(message)
  }
}
Kotlin

Copy

View(MyView::class) {
  AsyncFunction("myAsyncFunction") { view: MyView, message: String ->
    view.displayMessage(message);
  }
}
JavaScript

Copy


const MyNativeView = requireNativeViewManager('MyView');

function MyComponent() {
  const ref = React.useRef(null);

  React.useEffect(() => {
    ref.current?.myAsyncFunction();
  }, [ref]);

  return <MyNativeView ref={ref} />;
}
GroupView
Only for: 

Enables the view to be used as a view group. Definition components that are accepted as part of the group view definition: AddChildView, GetChildCount, GetChildViewAt, RemoveChildView, RemoveChildViewAt.

Arguments
viewType — The class of the native view. Note that the provided class must inherit from the Android ViewGroup.
definition: () -> ViewGroupDefinition — A builder of the view group definition.
This property can only be used within a View closure.

Kotlin

Copy


GroupView<ViewGroup> {
  AddChildView { parent, child, index -> ... }
}
AddChildView
Only for: 

Defines action that adds a child view to the view group.

Arguments
action: (parent: ParentType, child: ChildType, index: Int) -> () — An action that adds a child view to the view group.
This property can only be used within a GroupView closure.

Kotlin

Copy


AddChildView { parent, child: View, index ->
  parent.addView(child, index)
}
GetChildCount
Only for: 

Defines action the retrieves the number of child views in the view group.

Arguments
action: (parent: ParentType) -> Int — A function that returns number of child views.
This property can only be used within a GroupView closure.

Kotlin

Copy


GetChildCount { parent ->
  return@GetChildCount parent.childCount
}
GetChildViewAt
Only for: 

Defines action that retrieves a child view at a specific index from the view group.

Arguments
action: (parent: ParentType, index: Int) -> ChildType — A function that retrieves a child view at a specific index from the view group.
This property can only be used within a GroupView closure.

Kotlin

Copy


GetChildViewAt { parent, index ->
  parent.getChildAt(index)
}
RemoveChildView
Only for: 

Defines action that removes a specific child view from the view group.

Arguments
action: (parent: ParentType, child: ChildType) -> () — A function that remove a specific child view from the view group.
This property can only be used within a GroupView closure.

Kotlin

Copy


RemoveChildView { parent, child: View ->
  parent.removeView(child)
}
RemoveChildViewAt
Only for: 

Defines action that removes a child view at a specific index from the view group.

Arguments
action: (parent: ParentType, child: ChildType) -> () — A function that removes a child view at a specific index from the view group.
This property can only be used within a GroupView closure.

Kotlin

Copy


RemoveChildViewAt { parent, index ->
  parent.removeViewAt(child)
}
Argument types
Fundamentally, only primitive and serializable data can be passed back and forth between the runtimes. However, usually native modules need to receive custom data structures — more sophisticated than just the dictionary/map where the values are of unknown (Any) type and so each value has to be validated and cast on its own. The Expo Modules API provides protocols to make it more convenient to work with data objects, to provide automatic validation, and finally, to ensure native type-safety on each object member.

Primitives
All functions and view prop setters accept all common primitive types in Swift and Kotlin as the arguments. This includes arrays, dictionaries/maps and optionals of these primitive types.

Language	Supported primitive types
Swift	Bool, Int, Int8, Int16, Int32, Int64, UInt, UInt8, UInt16, UInt32, UInt64, Float32, Double, String
Kotlin	Boolean, Int, Long, Float, Double, String, Pair
Convertibles
Convertibles are native types that can be initialized from certain specific kinds of data received from JavaScript. Such types are allowed to be used as an argument type in Function's body. For example, when the CGPoint type is used as a function argument type, its instance can be created from an array of two numbers (x, y) or a JavaScript object with numeric x and y properties.

The built-in Convertibles are documented further below. You can define additional Convertibles by making native Swift types conform to the Convertible protocol:

Convertible
Only for: 

Convertible is a Swift protocol with one static method:

convert(value, appContext)
Parameter	Type	Description
value	Any?	
A value from JavaScript to convert

appContext	AppContext	
The context object for the currently running Expo app instance


A static method that converts a dynamically typed value from JavaScript to an instance of the Swift type conforming to Convertible. Implementers should throw an exception when the given value is invalid or of an unsupported type.

Returns:
Self
Example
Swift

Copy


import ExpoModulesCore

extension CMTime: @retroactive Convertible {
  public static func convert(from value: Any?, appContext: AppContext) throws -> CMTime {
    if let seconds = value as? Double {
      return CMTime(seconds: seconds, preferredTimescale: .max)
    }
    throw Conversions.ConvertingException<CMTime>(value)
  }
}
Support for defining Convertibles with Kotlin is planned to be available by SDK 53.
Built-in Convertibles
Some common iOS types from the CoreGraphics and UIKit system frameworks are already made convertible.

Native iOS Type	TypeScript
URL	string with a URL. When a scheme is not provided, it's assumed to be a file URL.
CGFloat	number
CGPoint	{ x: number, y: number } or number[] with x and y coords
CGSize	{ width: number, height: number } or number[] with width and height
CGVector	{ dx: number, dy: number } or number[] with dx and dy vector differentials
CGRect	{ x: number, y: number, width: number, height: number } or number[] with x, y, width and height values
CGColor
UIColor	Color hex strings (#RRGGBB, #RRGGBBAA, #RGB, #RGBA), named colors following the CSS3/SVG specification or "transparent"
Data	Uint8Array 
Similarly, some common Android types from packages like java.io, java.net, or android.graphics are also made convertible.

Note: On Android, primitive arrays should be used whenever possible.

Native Android Type	TypeScript
java.net.URL	string with a URL. Note that the scheme has to be provided (URL should not contain any unencoded % character)
android.net.Uri
java.net.URI	string with a URI. Note that the scheme has to be provided (URI should not contain any unencoded % character)
java.io.File
java.nio.file.Path (is only available on Android API 26)	string with a path to the file
android.graphics.Color	Color hex strings (#RRGGBB, #RRGGBBAA, #RGB, #RGBA), named colors following the CSS3/SVG specification or "transparent"
kotlin.Pair<A, B>	Array with two values, where the first one is of type A and the second is of type B
kotlin.ByteArray	Uint8Array 
kotlin.BooleanArray	boolean[]
kotlin.IntArray
kotlin.FloatArray
kotlin.LongArray
kotlin.DoubleArray	number[]
kotlin.time.Duration	number represents a duration in seconds 
Records
Record is a convertible type and an equivalent of the dictionary (Swift) or map (Kotlin), but represented as a struct where each field can have its type and provide a default value. It is a better way to represent a JavaScript object with the native type safety.

Swift

Copy

struct FileReadOptions: Record {
  @Field
  var encoding: String = "utf8"

  @Field
  var position: Int = 0

  @Field
  var length: Int?
}

// Now this record can be used as an argument of the functions or the view prop setters.
Function("readFile") { (path: String, options: FileReadOptions) -> String in
  // Read the file using given `options`
}
Kotlin

Copy

class FileReadOptions : Record {
  @Field
  val encoding: String = "utf8"

  @Field
  val position: Int = 0

  @Field
  val length: Int? = null
}

// Now this record can be used as an argument of the functions or the view prop setters.
Function("readFile") { path: String, options: FileReadOptions ->
  // Read the file using given `options`
}
Enums
With enums, we can go even further with the above example (with FileReadOptions record) and limit supported encodings to "utf8" and "base64". To use an enum as an argument or record field, it must represent a primitive value (for example, String, Int) and conform to Enumerable.

Swift

Copy

enum FileEncoding: String, Enumerable {
  case utf8
  case base64
}

struct FileReadOptions: Record {
  @Field
  var encoding: FileEncoding = .utf8
  ... 
}
Kotlin

Copy

// Note: the constructor must have an argument called value.
enum class FileEncoding(val value: String) : Enumerable {
  utf8("utf8"),
  base64("base64")
}

class FileReadOptions : Record {
  @Field
  val encoding: FileEncoding = FileEncoding.utf8
  ... 
}
Eithers
There are some use cases where you want to pass various types for a single function argument. This is where Either types might come in handy. They act as a container for a value of one of a couple of types.

Swift

Copy

Function("foo") { (bar: Either<String, Int>) in
  if let bar: String = bar.get() {
    // `bar` is a String
  }
  if let bar: Int = bar.get() {
    // `bar` is an Int
  }
}
Kotlin

Copy

Function("foo") { bar: Either<String, Int> ->
  bar.get(String::class).let {
    // `it` is a String
  }
  bar.get(Int::class).let {
    // `it` is an Int
  }
}
The implementation for three Either types is currently provided out of the box, allowing you to use up to four different subtypes.

Either<FirstType, SecondType> — A container for one of two types.
EitherOfThree<FirstType, SecondType, ThirdType> — A container for one of three types.
EitherOfFour<FirstType, SecondType, ThirdType, FourthType> — A container for one of four types.
JavaScript values
It's also possible to use a JavaScriptValue type which is a holder for any value that can be represented in JavaScript. This type is useful when you want to mutate the given argument or when you want to omit type validations and conversions. Note that using JavaScript-specific types is restricted to synchronous functions as all reads and writes in the JavaScript runtime must happen on the JavaScript thread. Any access to these values from different threads will result in a crash.

In addition to the raw value, the JavaScriptObject type can be used to allow only object types and JavaScriptFunction<ReturnType> for callbacks.

Swift

Copy

Function("mutateMe") { (value: JavaScriptValue) in
  if value.isObject() {
    let jsObject = value.getObject()
    jsObject.setProperty("expo", value: "modules")
  }
}

// or

Function("mutateMe") { (jsObject: JavaScriptObject) in
  jsObject.setProperty("expo", value: "modules")
}
Kotlin

Copy

Function("mutateMe") { value: JavaScriptValue ->
  if (value.isObject()) {
    val jsObject = value.getObject()
    jsObject.setProperty("expo", "modules")
  }
}

// or

Function("mutateMe") { jsObject: JavaScriptObject ->
  jsObject.setProperty("expo", "modules")
}
Native classes
Module
A base class for a native module.

Properties
appContext
Provides access to the AppContext.

Returns:
AppContext
Methods
sendEvent(eventName, payload)
Parameter	Type	Description
eventName	string	
The name of the JavaScript event

payload	Android: Map<String, Any?> | Bundle iOS: [String: Any?]	
The event payload


Sends an event with a given name and a payload to JavaScript. See Sending events

Returns:
void
AppContext
The app context is an interface to a single Expo app.

Properties
constants
Provides access to app's constants from legacy module registry.

Returns:
Android: ConstantsInterface? iOS: EXConstantsInterface?
permissions
Provides access to the permissions manager from legacy module registry.

Returns:
Android: Permissions? iOS: EXPermissionsInterface?
imageLoader
Provides access to the image loader from the legacy module registry.

Returns:
Android: ImageLoaderInterface? iOS: EXImageLoaderInterface?
barcodeScanner
Provides access to the bar code scanner manager from the legacy module registry.

Returns:
ImageLoaderInterface?
camera
Provides access to the camera view manager from the legacy module registry.

Returns:
CameraViewInterface?
font
Provides access to the font manager from the legacy module registry.

Returns:
FontManagerInterface?
sensor
Provides access to the sensor manager from the legacy module registry.

Returns:
SensorServiceInterface?
taskManager
Provides access to the task manager from the legacy module registry.

Returns:
TaskManagerInterface?
activityProvider
Provides access to the activity provider from the legacy module registry.

Returns:
ActivityProvider?
reactContext
Provides access to the react application context.

Returns:
Context?
hasActiveReactInstance
Checks if there is an not-null, alive react native instance.

Returns:
Boolean
utilities
Provides access to the utilities from legacy module registry.

Returns:
EXUtilitiesInterface?
ExpoView
A base class that should be used by all exported views.

On iOS, ExpoView extends the RCTView which handles some styles (for example, borders) and accessibility.

Properties
appContext
Provides access to the AppContext.

Returns:
AppContext
Extending ExpoView
To export your view using the View component, your custom class must inherit from the ExpoView. By doing that you will get access to the AppContext object. It's the only way of communicating with other modules and the JavaScript runtime. Also, you can't change constructor parameters, because provided view will be initialized by expo-modules-core.

Swift

Copy

class LinearGradientView: ExpoView {}

public class LinearGradientModule: Module {
  public func definition() -> ModuleDefinition {
    View(LinearGradientView.self) {
      ... 
    }
  }
}
Kotlin

Copy

class LinearGradientView(
  context: Context,
  appContext: AppContext,
) : ExpoView(context, appContext)

class LinearGradientModule : Module() {
  override fun definition() = ModuleDefinition {
    View(LinearGradientView::class) {
      ... 
    }
  }
}
Guides
Sending events
While JavaScript/TypeScript to Native communication is mostly covered by native functions, you might also want to let the JavaScript/TypeScript code know about certain system events, for example, when the clipboard content changes.

To do this, in the module definition, you need to provide the event names that the module can send using the Events definition component. After that, you can use the sendEvent(eventName, payload) function on the module instance to send the actual event with some payload. For example, a minimal clipboard implementation that sends native events may look like this:

Swift

Copy

let CLIPBOARD_CHANGED_EVENT_NAME = "onClipboardChanged"

public class ClipboardModule: Module {
  public func definition() -> ModuleDefinition {
    Events(CLIPBOARD_CHANGED_EVENT_NAME)

    OnStartObserving {
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(self.clipboardChangedListener),
        name: UIPasteboard.changedNotification,
        object: nil
      )
    }

    OnStopObserving {
      NotificationCenter.default.removeObserver(
        self,
        name: UIPasteboard.changedNotification,
        object: nil
      )
    }
  }

  @objc
  private func clipboardChangedListener() {
    sendEvent(CLIPBOARD_CHANGED_EVENT_NAME, [
      "contentTypes": availableContentTypes()
    ])
  }
}

Show More
Kotlin

Copy

const val CLIPBOARD_CHANGED_EVENT_NAME = "onClipboardChanged"

class ClipboardModule : Module() {
  override fun definition() = ModuleDefinition {
    Events(CLIPBOARD_CHANGED_EVENT_NAME)

    OnStartObserving {
      clipboardManager?.addPrimaryClipChangedListener(listener)
    }

    OnStopObserving {
      clipboardManager?.removePrimaryClipChangedListener(listener)
    }
  }

  private val clipboardManager: ClipboardManager?
    get() = appContext.reactContext?.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager

  private val listener = ClipboardManager.OnPrimaryClipChangedListener {
    clipboardManager?.primaryClipDescription?.let { clip ->
      this@ClipboardModule.sendEvent(
        CLIPBOARD_CHANGED_EVENT_NAME,
        bundleOf(
          "contentTypes" to availableContentTypes(clip)
        )
      )
    }
  }
}

Show More
To subscribe to these events in JavaScript/TypeScript, use addListener on the module object returned by requireNativeModule. Modules are extending the built-in EventEmitter class. Alternatively, you can use useEvent or useEventListener hooks.

TypeScript

Copy


import { requireNativeModule, NativeModule } from 'expo';

type ClipboardChangeEvent = {
  contentTypes: string[];
};

type ClipboardModuleEvents = {
  onClipboardChanged(event: ClipboardChangeEvent): void;
};

declare class ClipboardModule extends NativeModule<ClipboardModuleEvents> {}

const Clipboard = requireNativeModule<ClipboardModule>('Clipboard');

Clipboard.addListener('onClipboardChanged', (event: ClipboardChangeEvent) => {
  alert('Clipboard has changed');
});
View callbacks
Some events are connected to a certain view. For example, the touch event should be sent only to the underlying JavaScript view which was pressed. In that case, you can't use sendEvent described in Sending events. The expo-modules-core introduces a view callbacks mechanism to handle view-bound events.

To use it, in the view definition, you need to provide the event names that the view can send using the Events definition component. After that, you need to declare a property of type EventDispatcher in your view class. The name of the declared property has to be the same as the name exported in the Events component. Later, you can call it as a function and pass a payload of type [String: Any?] on iOS and Map<String, Any?> on Android.

Note:: On Android, it's possible to specify the payload type. In case of types that don't convert into objects, the payload will be encapsulated and stored under the payload key: {payload: <provided value>}.

Swift

Copy

class CameraViewModule: Module {
  public func definition() -> ModuleDefinition {
    View(CameraView.self) {
      Events(
        "onCameraReady"
      )
      ... 
    }
  }
}

class CameraView: ExpoView {
  let onCameraReady = EventDispatcher()

  func callOnCameraReady() {
    onCameraReady([
      "message": "Camera was mounted"
    ]);
  }
}

Show More
Kotlin

Copy

class CameraViewModule : Module() {
  override fun definition() = ModuleDefinition {
    View(ExpoCameraView::class) {
      Events(
        "onCameraReady"
      )
      ... 
    }
  }
}

class CameraView(
  context: Context,
  appContext: AppContext
) : ExpoView(context, appContext) {
  val onCameraReady by EventDispatcher()

  fun callOnCameraReady() {
    onCameraReady(mapOf(
      "message" to "Camera was mounted"
    ));
  }
}

Show More
To subscribe to these events in JavaScript/TypeScript, you need to pass a function to the native view as shown:

TypeScript

Copy


import { requireNativeViewManager } from 'expo-modules-core';

const CameraView = requireNativeViewManager('CameraView');

export default function MainView() {
  const onCameraReady = event => {
    console.log(event.nativeEvent);
  };

  return <CameraView onCameraReady={onCameraReady} />;
}
Provided payload is available under the nativeEvent key.

Examples
Swift

Copy

public class MyModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyFirstExpoModule")

    Function("hello") { (name: String) in
      return "Hello \(name)!"
    }
  }
}
Kotlin

Copy

class MyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyFirstExpoModule")

    Function("hello") { name: String ->
      return "Hello $name!"
    }
  }
}
For more examples from real modules, you can refer to Expo modules that already use this API on GitHub:

expo-battery
Swift
expo-cellular
Kotlin, Swift

expo-clipboard
Kotlin, Swift

expo-crypto
Kotlin, Swift

expo-device
Swift
expo-haptics
Swift
expo-image-manipulator
Swift
expo-image-picker
Kotlin, Swift

expo-linear-gradient
Kotlin, Swift

expo-localization
Kotlin, Swift

expo-store-review
Swift
expo-system-ui
Swift
expo-video-thumbnails
Swift
expo-web-browser
Kotlin, Swift