# 13 LIVES: THE POST MORTEM!

Welcome to the post mortem of my JS13k (2023) game: **13 Lives!**

That's... what my game was called for most of the two weeks I spent working on it.

After two (half) days researching "life during the XIII century", and gathering dozens of references and possible settings for my game, I reached the conclusion that my game would *have* to:

  * be a narrative, **non violent experience** (I kinda failed this one, sigh).

  * include interesting mechanics.

  * provide a unique point of view on how peasants lived their life.

For the longest time I wanted to create a game that would allow players to just "be": I'm tired of achievements, brainless activities and useless time wasters. Why can't we just chill out in different times and places, living someone else's life?

Quickly a branching storyline started forming in my brain: you are Rens, a peasant. You are born into peasant life, grow into it, become an adult, get married. Have kids. The Lord kills your wife. You paint your face, take a sword... and get killed the day after.

Or you never enter combat, but sickness takes away your beloved ones.

Or you fail to harvest enough food to feed your family.

Or the plague comes.

Or...

It was pretty bleak, but full of scenarios and ideas that would lead to intriguing storylines, each player creating their own little life!

But why keep it so "simple"? Let's go further: what if you are born... a Princess. Then you don't need to feed your family - but need to learn how to talk like a Lady. Be a good wife. Survive castle intrigues. And then maybe jump out of a window.

In no time I had a whole list of different paths for different characters: a peasant, a Princess. A crusader Knight with PTSD. A witch hidden in the forest, eating children. An alchemist, trying to find the way to learn Dark Magic from grimoires (it would be a real blow to learn that rat's piss and ale don't make a potion for eternal youth...).

In a couple hours I had 13 different archetypes or "lifes" you could jump into, with multiple paths for each one - paths that would cross one another. I had a list of settings, characters and it looked good!

A thunder hit my brain and **13 lives** was born.

By that time I was super excited - I thought about making this game for VR, something like Rick and Morty's "Life of Roy" game... but during the 13th century.

All was good... until the moment I googled that title and discovered a 2022 movie with the same name. This random and completely unrelated event made me start having second thoughts on the idea.

I said to myself "well, let's make it 12 lives then"... but the idea had already been fatally wounded and would die as fast as it came.

# Ok, just 1 life: THE PEASANT'S STORY

So I had to backtrack: this idea (while awesome) was *a tiny little bit* too ambitious for a JS13K game (oops). I started cutting storlines, characters, settings... at the end I had only one single character, with a very simple mechanic: you are born, and every day you play is one year for this character. Every day you go out, you do whatever you want to do, and by night you return home.

It would be monotonous and boring, with a few sparks of joy in between... like the real life of a 13th century peasant. One such spark of joy would be a Feast Day, in which you would be able to meet your spouse.

The idea of a Feast grew in my heart - I thought about how it could be done, with people dancing, drinking... nice music playing in the background. A few houses, perhaps a forest?

You could walk through the forest, talk to **everybody**, and then, perhaps... find love. And after that you would go back home. Then work on the fields. Go back home. Work. Go back home and discover you have kids now. Then work. Then the plague. Then you have one child less. Then....

Bruegel's "The Peasant Dance" inspired me greatly.

![](https://raw.githubusercontent.com/wololoa/js13k2023/main/screens/feast.jpg)

By that time, two weeks had passed and I had no solid idea, no code, nothing to account for. I quickly tested multiple frameworks and decided it was time to get serious.

# Medieval rooms: the game

I managed to put together a (mini) tech demo that had:

  * "sprites" (3d billboards)
  * "rooms" (basically textured boxes surrounding the player to simulate a house or building interior)
  * "look around" camera
  * basic physics (you could grab and throw around objects)

With some CC0 sprites I found on the web and a few of my own, I made this:

![](https://raw.githubusercontent.com/wololoa/js13k2023/main/screens/peasant.jpg)

By this point, I thought the idea was shit: I originally started with this awesome study of medieval life to end up doing... a simple "click here" simulation.

The game was supposed to work on mobile and desktop (I quickly discarded VR), but static game would be too boring.

"What about walking?" I thought. "Nah, let's keep it static".

"What about if the character just walks... through the forest, and... things happen?""

Believe it or not, I started pondering the idea of making a "medieval autorunner game" in which you would just... run? Avoid trees?

That was incredibly stupid: not only was it lacking originality, but it was also an insult to the "let's simulate the life of a Medieval peasant" motto.

But I still had no forest, so I made one with my "room" technique. It looked like...

![](https://raw.githubusercontent.com/wololoa/js13k2023/main/screens/duck.jpg)

# DUCK HUNT: THE INFLEXION POINT

After many hours of development, research and coding... I realized I was making Duck Hunt. I even joked about it on twitter.

And for some reason... I couldn't stop thinking about doing an *actual* duck hunt game. Of course, me being me I couldn't just clone that game - I had to find something worth doing - something "artistic".

Because I apparently cannot survive making "happy" things (dark atmospheres come natural to me I guess), an image I had seen many years ago came back to me: a dark, gritty forest full of... witches. Or demons. Or ghosts. I don't know - it was scary shit.

It took me hours but I finally found the forgotten reference: the amazing art of [Yuri Hill](https://www.artstation.com/hill).

![](https://cdna.artstation.com/p/assets/images/images/017/961/028/large/yuri-hill-mars97-2.jpg)

_walk, by Yuri Hill_

I was _thrilled_: THAT looked amazing and I could totally do it. Of course I had no real idea about mechanics, gameplay loop or anything else. But that atmosphere...

It was too strong to fight it off. But of course that path would take me far away from my original "let's do a narrative, non violent game, yay!".

This haunted me for days - I really struggled. Should I do a game about talking to people? Or about shooting demons?

Then (not too long afterwards), someone simply said "why not both".

That was the beginning of the end.

# Who put a shotgun on my narrative game?

Now, there's something we need to clear out: what you see in the game is not a shotgun, but rather a Chinese-made "soul buster"...hand cannon. They were invented in China in the X century, and by the XIII century, many of them were available in Europe.

But this "historically accurate" trivia didn't change the fact that someone (well, me) put a shotgun on my game!

![](https://raw.githubusercontent.com/wololoa/js13k2023/main/screens/forest.jpg)

How could I reconcile a "narrative game with unique mechanics" with a game about shooting demons to the face?

Well... have you tried talking to the monsters? There's even a whole meme / subculture about not being able to talk with the monsters of Doom.

(My personal take is that running around shooting things on the face makes *you* the monster, and the reason you can't talk to yourself inside the game is... well, tricky).

Which made me think that perhaps there *is* a way to put them together.

I quickly prototyped a mechanism to detect when the player nods or shakes (inspired directly by Alba's Adventure - who would have thought that a game so pure and innocent would help me create this monstrosity) and got running!

By this point I had most of the art in place and lots of code without a single loop.

You could talk to NPC's, and then shoot them. But there was nothing in between.

So I started thinking about ways to "transform" the innocent looking people into monsters, to give you an excuse to shoot them. The core idea was (finally!) starting to reveal itself: late during a feast night, you (a cleric) are requested to go out of the temple... for reasons (I never thought this out, really) and you encounter many lost people in the forest - most of them drunk.

(At one moment I wanted to make a more adult oriented game with some NPC's participating in sexual activities, others puking... gross stuff. Sorry!).

And then... well, you talk to them! They ask you things... and you reply. Depending on your answers, this could trigger a "demon turning" phase in which you would just... shoot them down.

By this point I knew what the game was gonna be called:

![](https://raw.githubusercontent.com/wololoa/js13k2023/main/screens/night.jpg)

_Feast Night. Yeah_

# Life is meaningless - unless you can choose your path

With only one week to go, I had something resembling a game loop, but it was still lacking, not really interesting, with no proper ending screens and no music. Worst of all? There was no true meaning behind the game: you could either "save" some peasants (talk to them without them turning into demons), go straight to the finish line (disappointing) or force them to become demons and shoot them in the face until you got caught by one. Booo.

With only a few days to finish, @jacklehamster introduced me to the world of Soundbox and I started researching music. I had a somewhat clear vision about the type of atmosphere I wanted to create, but I totally failed at finding the right music.

I first tried doing a custom version of ALFONSO X "Cantigas de Santa Maria" (which was cool but better for a Tetris game in my opinion). For some reason at this point I started singing out loud [Bach's Badinerie](https://youtu.be/Tv40mcAM1ZA) and I thought "why not this?".

It took me around 8 hours of work to compose the songs, sounds and implement the new system on my game. It was cool... but really not what the game needed: the new sounds were not as impressive as the raw effects from ZzFX, and the music made the game look like something it wasn't meant to be: a silly arcade game about shooting demons in the face.

(Ok ok, in a sense *that is exactly what the game is about*, but... I had other plans, ok?).

Further researching, I discovered a poem (and a melody) created during the XIII century whose echoes can still be heard on symphonies and soundtracks up to this day: the [DIES IRAE](https://en.wikipedia.org/wiki/Dies_irae)

While the music wasn't still suitable for the game, the whole concept got me deep: what if you are actually on *your* DIES IRAE, living inside an eternal loop in which you are tested to enter Heaven?

This idea fit so well that I finally had the whole picture complete - the theme, the story, the goal, the reasons behind it... and this also gave me the game's most important mechanic: once you die you are brought again to relive the same moment... and learn from your mistakes.

With all the pieces in place I only had to solidify what were the actual choices and consequences for the player. Without giving it much thought, I arrived to the final implementation:

  * You only have 11 attempts ("loops") before you get lost in the purgatory forever (black screen).
  * If you talk to no-one but reach the doors of Heaven - you won't be allowed to enter, but you will see Saint Peter.
  * If you save 3 or more souls (it's supposed to be five, but there's a bug in there), you can go to Heaven's Door and you will... probably... be happy forever?
  * If you start killing "demons", you are greeted by the Devil himself. And depending on how many you manage to take down... you can become the new Devil!

On each new loop, the priest that greets you will provide you more and more information, meaning that by the end of the way you should have at least some notion of what is going on.

# FEAST NIGHT: THE TECH

If the design part of the game was a never-ending rollercoaster that (luckily) had a somewhat happy ending (no pun intended), the tech side ran much smoother: after setting on [lightgl.js](https://github.com/evanw/lightgl.js/), development was easy.

In order to simplify the code and not having to worry too much about downsizing it at the end (which still happened - but only due to having too much text data, which is trivial to trim down), I chose several coding restrictions, which made me write very simple code with only a handful instances of ["spaguettitis"](https://en.wikipedia.org/wiki/Spaghetti_code).

  * No classes, no weird hierarchies: **everything** must be plain old data objects.
  * There is only one high level "object" for everything in the game (from NPC's to trees to your gun - it's all a simple object container with a bunch of members for common things inside).
  * No separation in multiple files, with the exception of lightgl.js - everything is on index.html.
  * Reuse as much as possible! Instead of creating boolean flags for specific things - reuse unused variables. FUN FACT: there is only 1 (yes, one) bullet that gets shot once and again :)
  * Encapsulate in functions only when that code is used in multiple places (and you can save at least 2x bytes vs just inlining). Without counting lightgl.js classes and functions, the game runs with only 23 functions (which depending on your point of view about programming, can be seen as total shit :D ).
  * Use "constants" for _everything_: object type, mesh indices, game states, etc: everything is an integer constant. Once you are done you can just rely on using numbers instead of big named-constants.
  * Don't be afraid of breaking "gamedev rules", adding logic into functions that otherwise shouldn't have it (like doing some update calculations inside the draw function, etc).
  * Finally: write almost as many comments as code. Even for trivial things - I knew I wouldn't remember them later on, and going back to the comments made things super easy (I remember the comments, but not the actual code, which makes it easy just to search for keywords and get there).

Obviously this goes against pretty much all rules for writing good code - but I found it extremely efficient for size (minimal code produced, little to zero "fat to trim" afterwards), and for prototyping (because there are no classes, hierarchies or infinite encapsulation, the code is *very* flexible).

This has the disadvantage that mechanics, rules and logic are scattered on many different places (for a bigger game this would be suicide). This also meant refactoring once in a while to group things that surely belonged together, but were apart on the code.

## Optimizations

Not that many: the game is just tinified (minify-js) and then sent to roadroller (with default settings). The zip is a standard zip. The atlas is a PNG 128 x 128 image with 8 colors (+alpha). After drawing it I would minify it with tinypng (reducing it from around 7-9kb to 1-2kb), and after that I would just convert to base64 (2-3kb). 

## Rendering

There isn't really much to the rendering of the game: objects are stored inside an array, which gets iterated and drawn (sorry for such stupid description, but that's all that there is). At some point I had to add sorting due to alpha, but that's pretty much it.

The whole game uses a single shader (which has the super unique name of "shader" lol) which is responsible for providing all the behaviors needed for each type of "renderable" (which are simply called "sprites").

Each object has different members that determine its position, rotation, scaling... but also "light override" (used for example when shooting), and a "factor" value (which shifts the UV's in the shader: this is used to control the NPC's transformation into demons - the "demonized" version of each sprite is right above the actual NPC sprite, by shifting the UV's along the Y coordinate and blending between the two, you get a nice smooth transformation).

Besides this, every object gets faded by fog (using standard fog calculations). And finally, super bright colors aren't shaded, which makes the moon super bright not faded by fog, and the demon's eyes (I picked this trick from Phoboslab's "Underrun" game :) ).

There are a few objects that receive an extra treatment and get drawn independently - for example the gun and the buildings.

By the way, the only form of optimization is a very simple form of occlusion culling applied only to trees along the Z axis (trees and bushes are only drawn if they are close enough to the player). Everything else is rendered each frame (super important for NPC's and the moon). I didn't even spend time trying to do batching or applying any other optimization technique (it would be possible to draw pretty much the whole game with 1 drawcall only) - with the low amount of objects and geometry involved (only one texture binded at all times!), there really is no point in doing more than this. 

**Disclaimer**: I tested the game on my old laptop (i6 CPU with integrated shitty Intel graphic card) and performance was terrible. If you have one of those laptops - sorry for the poor performance! :O

Fun fact: I failed making billboards on the shader, so what you see is an actual rotation of each sprite to face the player (some objects have this disabled and that's why they don't behave like billboards).
        
        uniform sampler2D texture;   // atlas
        uniform float factor;        // controls UV shifting
        uniform float over;          // "override" power (fake lighting)
        uniform vec2 sky;            // fog color (R and B only, G never changes)
        varying vec2 coord;
        varying vec4 pos;
        
        float fogf(float d) {        // standard fog calculation
            const float LOG2 = -1.442695;
            return 1.0 - clamp(exp2(d*d*LOG2), 0.0, 1.0);
        }
        
        void main() {
            vec4 os = texture2D(texture, coord);                    // the texture at the current texel
            vec4 ms = texture2D(texture, coord + vec2(0.0, 0.25));  // the texture, shifted one tile up
            os = mix(os, ms, factor);                               // "factor" controls how much of each you see
            if(os.a < 0.8) discard;                                 // the only way I found to have truly transparent sprites
            float fog = fogf(gl_FragCoord.z/gl_FragCoord.w * 0.5);  // good old fog - the same for all objects
            
            // a terrible way of calculating a fake lighting from the player's position (visible when shooting)            
            float d = (1.0 / distance(vec4(0.0, 0.0, 0.0, 0.0), pos)) * (over - 1.0);

            // blend everything: the mesh texture color, fog and fake lighting
            gl_FragColor = mix(os, vec4(sky.x, 0.26, sky.y, 1.0), fog) + (vec4(0.87, 0.46, 0.051, 1.0) * d);
            
            // ...and at the end: if the color is bright enough, draw it without fog or "lighting" (the demon's eyes and the moon)
            if(os.r > 0.9 && os.g > 0.9) gl_FragColor = os;
        }

_The only shader for the whole game_

## Audio

The whole audio is written using ZzFX. I created a small "manager" and one single function "sfx" that accepts a single parameter - a constant which references the index of a ZzFX sound inside a global sound array.

The only music on the game is played on the FPS part of the game and it's all done by code - inside an array I coded when a sound (drum) should be played and that's all.

One small comment: a couple days before the deadline I spent around 8 hours writing and implementing music and sound effects entirely using soundbox. Sadly this music didn't fit the tone of the game and had to be discarded - I put those unused files in the /assets folder if you are curious about them :)


## "Physics"

The original version included "object picking" with basic physics for moving and throwing objects. This was deleted in the final game - except the code for collisions: it runs using simple AABB detection and is used to check collisions between the player and the NPC's, the trees and the (1) bullet.

For detecting collisions within the room and the map's limits, a simple clamp is used on the camera's position.

## Input

Input is running using standard lightgl.js methods. I had to add however a simple detection mechanism when the player nods ("yes", up and down movement) or shakes ("no", left and right).

The way this is accomplished is by first checking the biggest axis on each delta (are we moving more up and down or left and right?), and then checking differences in delta in the other direction while maintaining the same axis. Once this "shift" in orientation is detected 3 times, a function with the player's input is called - which is only taken into consideration if NPC'S are human, you are in contact with one of them (aabb's are touching) and they still have something to say.

## State machine

This is probably the worst code decision, but the entire state machine is coded as a big if-else-if inside... the drawing function :)

The reasoning for doing so is that I didn't want to replicate this same massive code structure in multiple places, so I picked the place it was needed the most and performed all rendering and logic there*.

(* There are a few places in which additional logic had to be added, but most of it is on _draw_).

# FINALLY: WHAT WENT RIGHT

Despite the ups and downs and the fact that the game mutated *many many times* during its short development, I am extremely happy about the results. These are all the things I consider went right:

  * Using light.gl. After trimming it (using the "coverage" devtool), it became super small, and besides a few crazy tricks (hello box creation code!), the code is _extremely clean_ and provides ALL the basic functionality (and then some) needed for a game. I totally recommend it.

  * Trying out a new and crazy "coding manifesto". I don't know if I spent too long using Unity, but developing in JS + WebGL was a joy. I don't remember the last time I was able to write, rewrite and modify code doing multiple prototypes or changing entirely the game's features and objectives so quickly!

  * Sticking to the "narrative" side. While the conversational part might be disappointing and the FPS aspect is clearly undercooked and not balanced at all, I love how weird the game turned out to be. It is indeed a nice blend of two worlds that are usually never mixed (at least not like this).

  * The art style! I struggled at times with the amount of bytes I spent on the atlas (128 x 128 pixels!), but overall I am very proud of that style, the color palette and the tone of the game.

  * Not being afraid of iterating until finding the true heart of the game. It was literally the 12th when I found about "Dies Irae" which put the whole game into perspective. Likewise, the "metagame" loop was something I implemented the last day in a couple hours after I had the idea of "judgement".

  * Running a small "beta testing" session. The first (raw, partially broken, unfinished) version of the game was ready by the 8th. I asked a few friends for feedback and this gave me super valuable information. Without doing this small testing session, the game would be awful today! (And perhaps even less clear).

![](https://raw.githubusercontent.com/wololoa/js13k2023/main/screens/tiles.jpg)

_The (single) atlas used for the whole game - the amount of space I'm wasting is awful, please don't look at it!_

# AND WHAT WENT WRONG?

Well well well... so many things went wrong, that I can probably count more blunders than victories. I will probably forget some, but these were the worst mistakes I can remember:

  * Finding soundbox so late and spending so much with it. If I had more time earlier, I'm sure I could have done a game much better and more atmospheric. ZzFX is awesome, but finding the right sound requires a long and painful process of listening noise for hours...until you get what you need. Soundbox on the other hand is awesome and can be used to create awesome sounds too (not only music), but I found it easier making songs than sounds. I believe the published version that is running with ZzFX only is superior. (Shoutout to @jacklehammer for helping me with soundbox!).
    
  * Spending so much time thinking, designing, iterating and... defining the game. I don't regret the time spent, but I feel I still spent way too much time lost in the labyrinths of my own mind before finding the game (this could very well be unavoidable).
    
  * Using so many 3 letter shitty variables instead of coming up with a better system :)
    
  * The "meta game" feature was coded so late (around 2 am I believe) that I really was in no shape or mood to make something more elaborated (I wanted to use it to lock each one of the winning screens, but I failed terribly and decided to focus only on saving your last "run").
    
  * Waiting too long before starting - which means very few people got to test the game before it was published. If I ran (more) tests earlier, I could improve the game further!

  * Shitty endings. Sure, there are many of them - but they are... lackluster.

  * I totally failed making it clear for the players *what they were supposed to do*. This could have been done so much better - and it's very much linked with the issue of starting testing "too late".

  * Play less, but more critically. Instead of playing the same bits a million times (partially because I liked them!) I should focus more on finding errors - and more importantly: rest one or two days before replaying everything! You can only see errors with fresh eyes - which won't happen in a 12 hour programming session :)

  * Zero tools: everything you see was fine tuned by code. Luckily JS development is so fast that it took me no time changing something, reloading and checking it. But having *any* tools would speed up this process considerably (for example a flying camera on the scene...).

  * Things I wanted to add but had no time to:
    - lighting
    - birds flying
    - wind sound
    - flying leaves
    - ceiling on the church (outside)
    - more interiors
    - "hell" background
    - clouds in the sky
    - feedback when a soul is "saved"
    - particle effects when killing demons
    - head bob when walking
    - better gun animations
    - any interesting mechanic in the FPS segment (besides just running and shooting...)

# THE END?

This has been the wildest game I ever made, and besides a few negative points - I'm not only happy about the results, but also about this way of making games, and returning to JS.

If you managed to get this far - thank you for reading! :)
Now - go back and play the game!
