Expo Modules API: Overview


Copy

An overview of the APIs and utilities provided by Expo to develop native modules.

What is the Expo Modules API
The Expo Modules API allows you to write Swift and Kotlin to add new capabilities to your app with native modules and views. The API is designed to take advantage of modern language features, to be as consistent as possible on both platforms, to require minimal boilerplate, and provide comparable performance characteristics to React Native's Turbo Modules API. Expo Modules all support the New Architecture and are automatically backwards compatible with existing React Native apps using the old architecture.

We believe that using the Expo Modules API makes building and maintaining nearly all kinds of React Native modules about as easy as it can be, and we think that the Expo Modules API is the best choice for the vast majority of developers building native modules for their apps.

Common questions
Do I need to know the Expo Modules API to build an Expo / React Native app?
Most of the time, Expo and React Native developers don't need to write any native code — libraries are already available for a wide range of use cases, from camera to video to maps to haptics and much more.

But sometimes, nothing does exactly what you need. Maybe you want to integrate an analytics service that your company mandates but that doesn't yet have a React Native library yet, so you need to build a module around their SDK. Or maybe you want to access a system feature that your app requires, but isn't commonly used, so nobody maintains a library for it.

When should I use Turbo Modules and when should I use the Expo Modules API?
To summarize and paraphrase the recommendation from the React Native team:

If you intend to use C++ in your native module, use Turbo Modules since it provides easier access to lower-level mechanisms.
If you are looking for a better developer experience and you are willing to depend on the expo package in your module, then use the Expo Modules API.
Where can I find open source Expo Modules to learn from?
The Expo SDK is a great place to look if you want to learn how we have implemented our libraries. Another great resource is open source apps, such as Bluesky.

The following libraries are some of our favorites from the community:

react-native-widget-extension
burnt
expo-video-metadata
swiftui-react-native
react-native-ios-context-menu
react-native-mlkit
react-native-passkeys
expo-drag-drop-content-view
What impact does using the Expo Modules API have on my app size?
Adding the Expo Modules API to your app has a negligible impact on your app size, it may increase the size by a few hundred kilobytes. Learn more in this blog post.

What impact does using the Expo Modules API have on my app's performance?
The Expo Modules API has similar performance characteristics to React Native's Turbo Modules API. Both APIs leverage React Native's JavaScript Interface (JSI), rather than the legacy approach of using a JSON message queue ("bridge") (learn more about JSI).

Neither Expo Modules nor Turbo Modules are designed to be as fast as technically possible, but rather they are fast where it matters. For example, the Expo Modules API could leverage code generation and the new native Swift / C++ interop to reduce the overhead of individual method calls. However, this imposes some developer experience challenges and overhead, and we have not yet encountered any use cases where such an optimization would provide any meaningful real-world performance improvements. In reality, the time spent executing the body of a native method is often orders of magnitude greater than the overhead of the method invocation. Both Expo Modules and Turbo Modules can easily execute hundreds of thousands of native method calls per second, which is well over what you are likely to find in any app, and the overhead of the method calls is unlikely to be the bottleneck.

If you encounter any performance bottlenecks with the Expo Modules API, file an issue and we'd be happy to discuss it with you.

Does the Expo Modules API support platforms other than Android, iOS, and web?
The Expo Modules API has experimental support for macOS and tvOS. See Additional platform support tutorial for more information.

How can I use the Expo Modules API to make a third-party SDK available to my Expo app?
Learn more about this in the Integrate an existing library tutorial.