/*
    Raymond Lin Pd 7-8 Even
    
    1.Using h1 to only show the main title of the page so that it makes the page more clear
    2. using tags like main and footer
    3. Can use keyboard input to use the buttons. (Tab to select which move)
    4. Use ARIA roles and landmarks
    5. Make dynamic content accessible - Added an alert when you can do a finisher move 


    Added more information about what the goal of the game is.
    I made sure to use tables for data and not layout.
    The page has an alert when you win
    Added a media query to make the tables fit in the div


    
**/
document.addEventListener("DOMContentLoaded", function() 
{
    var player = 
    {
        'Strength': 6,
        "Cunning": 6,
        'Speed': 6,
        'Fatigue': 30
    };
    var computer = 
    {
        'Strength': 6,
        "Cunning": 6,
        'Speed': 6,
        'Fatigue': 30
    };
    var playerOrgStats = {};
    var computerOrgStats = {};

    var playerStatsContainer = document.getElementById('player-stats-table');
    var computerStatsContainer = document.getElementById('computer-stats-table');
 

    // functions
    function getRandomInteger(lower, upper) {
        var multiplier = upper - (lower - 1);
        var rnd = parseInt(Math.random() * multiplier) + lower;
        return rnd;
    }

    function initialize()
    {
        generateFightersVals(player);
        
        generateFightersVals(computer);
        playerOrgStats = structuredClone(player);
        computerOrgStats = structuredClone(computer);

        displayStats(player, playerStatsContainer);
        displayStats(computer, computerStatsContainer);

        addButtonListener('fight');
        addButtonListener('defend');
        addButtonListener('finisher');
    }
    function addButtonListener(id)
    {
        document.getElementById(id).addEventListener('click', function(e) {
                battle(id);
        });
    }
    function displayStats(fighter, container)
    {
        // Create table for stats
        for (const [key, value] of Object.entries(fighter)) 
        {
            // create new row
            let newRow = container.insertRow();
            // Stat heading
            var newCell = newRow.insertCell();
            newCell.innerHTML = key;
            // Stat Org value
            var newCell = newRow.insertCell();
            newCell.innerHTML = value;
            // Stat Current Value
            var newCell = newRow.insertCell();
            newCell.innerHTML = value;
            newCell.classList.add(key);
        }
    }
    function generateFightersVals(fighter)
    {
        
        fighter['Fatigue'] += getRandomInteger(0, 6);

        fighter['Strength'] += getRandomInteger(0, 1);
        fighter['Cunning'] += getRandomInteger(0, 1);
        fighter['Speed'] += getRandomInteger(0, 1);
        
        // Increase 2 stats by 1 and Decreease 2 stats by 1
        let increaseStats = new Set(); 
        let rndIncreaseStat = getRandomStat();
        while (increaseStats.size < 2 && !increaseStats.has(rndIncreaseStat))
        {
            increaseStats.add(rndIncreaseStat);
            fighter[rndIncreaseStat] += 1;
            rndIncreaseStat = getRandomStat();
        }
        let decreaseStats = new Set();
        let rndDecreaseStat = getRandomStat();
        while (decreaseStats.size < 2)
        {

            if (!increaseStats.has(rndDecreaseStat) && !decreaseStats.has(rndDecreaseStat))
            {
                decreaseStats.add(rndDecreaseStat);
                fighter[rndDecreaseStat] -= 1;

            } 
            rndDecreaseStat = getRandomStat();
        }  
    }
    function getRandomStat()
    {
        return Object.keys(player)[Math.floor(Math.random() * Object.keys(player).length)];
    }
    function calcAttack(fighter, isFinisher)
    {
        if (isFinisher)
        {
            return Math.round((fighter['Strength'] + fighter['Speed'])/getRandomInteger(1, 3));
        }
        return Math.round((fighter['Strength'] + fighter['Speed'] + fighter['Cunning'])/getRandomInteger(1, 3));
    }
    function calcDefense(fighter, isDefending)
    {
        if (isDefending)
        {
            return Math.round(fighter['Speed'] + fighter['Cunning']);
        }
        return fighter['Speed'] + getRandomInteger(1, 6);
    }
    function canDoFinisher()
    {
        if (computer["Fatigue"] < 0 || computer["Fatigue"] * 2 <= player["Fatigue"])
        {
            if (!document.getElementById("finisher").classList.contains("appear"))
            {   
               alert("You can now do a finisher to beat your opponent"); 
            }
            document.getElementById('finisher').classList.add('appear');
            return 'player';
        }
        if (player["Fatigue"] < 0 || player["Fatigue"] * 2 <= computer["Fatigue"] )
        {
            return 'computer';
        }
    }
    // 0 is fight, 1 is defense, 2 is for finisher
    function computerChoice()
    {
        if (canDoFinisher() == 'computer')
        {
            return 'finisher';
        }
        let rnd = getRandomInteger(0, 1);
        if (rnd == 0)
        {
            return 'fight';
        }
        else
        {
            return 'defend';
        }
    }

    function battle(playerMove)
    {
        // disappear finisher
        // document.getElementById('finisher').classList.remove('appear');

        let computerMove = computerChoice();
        let playerAttack;
        let playerDefense;
        let computerAttack;
        let computerDefense;
      
        // do move returns a array with the player attack and if they picked defend
        let computerMoveResults = doMove(computer, computerMove);
        let playerMoveResults = doMove(player, playerMove);

        playerAttack = playerMoveResults[0];
        computerAttack = computerMoveResults[0];


        // needs to calc defense every turn
        computerDefense = calcDefense(computer, computerMoveResults[1]);
        playerDefense = calcDefense(player, playerMoveResults[1]);

        // Attack
        // Fatigue is altered if attacked
        let playerFatigueChange = 0;
        let computerFatigueChange = 0;
    
        if (playerAttack > computerDefense)
        {
            computerFatigueChange = computerDefense - playerAttack;
            computer['Fatigue'] += computerFatigueChange;
        }
        else if (computerAttack > playerDefense)
        {
            playerFatigueChange =  playerDefense - computerAttack;
            player['Fatigue'] += playerFatigueChange;
        }

        // if player defended and took no damage then regain some fatigue
        if (playerMove == 'defend' && playerFatigueChange == 0)
        {
            playerFatigueChange = defend(player, playerOrgStats['Fatigue']);
        }
        else if (computerMove == 'defend' && computerFatigueChange == 0)
        {
            computerFatigueChange += defend(computer, computerOrgStats['Fatigue']);
        }
        else if (computerMove == 'defend' && playerMove == 'defend')
        {
            // if both defend then both get fatigue back
            computerFatigueChange += defend(computer, computerOrgStats['Fatigue']);
            playerFatigueChange += defend(player, playerOrgStats['Fatigue']);
        }

      
        
        // Info to display on the log
        let playerTurnInfo = 
        {
            'Player move': playerMove,
            'Player Attack': playerAttack,
            'Player Defense': playerDefense,
            'Player Fatigue Change': playerFatigueChange 
        }
        let computerTurnInfo = 
        {
            'Computer move': computerMove,
            'Computer Attack': computerAttack,
            'Computer Defense': computerDefense,
            'Computer Fatigue Change': computerFatigueChange 
        }
        

        // Extension gain stats when regaining fatigue and lose stats when losing fatigue
        let pStatChangeMessage = checkFatigueChange(player, playerOrgStats, playerFatigueChange);
        let cStatChangeMessage = checkFatigueChange(computer, computerOrgStats, computerFatigueChange);

        canDoFinisher();
        updateStats(player, 0);
        updateStats(computer, 1);
        display(playerTurnInfo, computerTurnInfo, pStatChangeMessage, cStatChangeMessage);
    }
    function checkFatigueChange(fighter, fighterOrgStats, fatigueChange)
    {
        let isChanged = false;
        if (fatigueChange <= -5)
        {
            for (const [key] of Object.entries(fighter))
            {
                if (fighter[key] != 0 )
                {
                   fighter[key] -= 1;
                   isChanged = true;
                }
                 
            }
            if (isChanged)
            {
                return 'lost stats';
            }
            
        }
        else if (fatigueChange >= 5)
        {
            for (const [key] of Object.entries(fighter))
            {
                if (fighterOrgStats[key] >= fighter[key] + 1)
                {
                     fighter[key] += 1;
                     isChanged = true;
                }      
            }
            if (isChanged)
            {
                return 'gained stats';
            }
            
        }
    }
    function doMove(fighter, moveChoice)
    {
        let attack;
        let isDefending;
        switch(moveChoice)
        {
            case 'fight':
                attack = calcAttack(fighter, false);
                break;
            case 'defend':
                isDefending = true;
                break;
            case 'finisher':
                attack = calcAttack(fighter, true);
                
                if (attack > 1)
                {
                    fighter == player ? win('player') : win('computer');
                }
                break;
        }
        return [attack, isDefending];
    }
    function defend(fighter, orgFatigue)
    {
        let fatigueChange = getRandomInteger(1, 6);
        fighter["Fatigue"] += fatigueChange;
        if (fighter["Fatigue"] > orgFatigue)
        {
            fighter["Fatigue"] = orgFatigue;
        }
        return fatigueChange;
    }
    /**
     * 
     * @param {*} fighter 
     * @param {index of the log (0 is player, 1 is computer)} index 
     */
    function updateStats(fighter, index)
    {
        document.getElementsByClassName('Strength')[index].innerHTML = fighter['Strength'];
        document.getElementsByClassName('Cunning')[index].innerHTML = fighter['Cunning'];
        document.getElementsByClassName('Speed')[index].innerHTML = fighter['Speed'];
        document.getElementsByClassName('Fatigue')[index].innerHTML = fighter['Fatigue'];
    }
    
    function display(playerInfo, computerInfo, playerStatMessage, computerStatMessage)
    {
       for (const [key, value] of Object.entries(playerInfo))
       {
        if (value != undefined)
        {
            document.getElementById('player-log').innerHTML += key + ': ' + value + "<br>";
        }
       }
       for (const [key, value] of Object.entries(computerInfo))
       {
        if (value != undefined)
        {
            document.getElementById('computer-log').innerHTML += key + ': ' + value + "<br>";
        }
       }
       if (playerStatMessage != undefined)
       {
        document.getElementById('player-log').innerHTML += 'Player ' + playerStatMessage + "<br>";
       }
       
       document.getElementById('player-log').innerHTML += "<br>";
       if (computerStatMessage != undefined)
       {
        document.getElementById('computer-log').innerHTML += 'Computer ' +  computerStatMessage + "<br>";
       }
       
       document.getElementById('computer-log').innerHTML += "<br>";
    }
    function win(winner)
    {
        alert('Winner is ' + winner);
        //document.getElementById('finisher').classList.remove('appear');
        location.reload();
        
    }
    
    // Call functions
    initialize();
});
