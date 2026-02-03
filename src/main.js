"use strict"
import dayjs from 'https://cdn.skypack.dev/dayjs';
import 'https://cdn.skypack.dev/dayjs/locale/pt-br'
dayjs.locale("pt-br")

const newScheduleButton = document.querySelector('#newScheduleButton');
const form = document.querySelector('form');
const main = document.querySelector('main');
const logo = document.querySelector('.logo');
const dayChoosen = document.querySelector('.dayChoosen input');

const today = dayjs(new Date()).format('YYYY-MM-DD');
const time = dayjs(new Date()).format('HH:mm');

dayChoosen.value = today;
dayChoosen.min = today;
await loadSchedules(today);

async function loadSchedules(dayChoosen){

    const morningList = document.querySelector('.morning-list');
    const afternoonList = document.querySelector('.afternoon-list');
    const eveningList = document.querySelector('.evening-list');

    morningList.innerHTML = '';
    afternoonList.innerHTML = '';
    eveningList.innerHTML = '';
    

    try{

        const response = await fetch('http://localhost:3000/schedules');
        const data = await response.json();
        const dailySchedules = data.filter((schedules) => {
            return dayjs(dayChoosen).isSame(schedules.day,'day');
        })

        showDailySchedules(dailySchedules);

    }catch(error){
        alert('Não foi possível carregar os agendamentos reegistrados!');
    }
}

async function showDailySchedules(dailySchedules){

    try {
        let period; 
        dailySchedules.forEach((schedule) => {
            if(schedule.time >= 9 && schedule.time <= 12 ){
                period = document.querySelector('.morning-list');
            } 
            else if(schedule.time >= 13 && schedule.time <= 18 ){
                period = document.querySelector('.afternoon-list');
            }
            else if(schedule.time >= 19 && schedule.time <= 21 ){
                period = document.querySelector('.evening-list');
            }else{
                throw new Error('Horário não permitido');
            }

            const object = document.createElement('li');
            object.setAttribute('data-id', schedule.id);
            const scheduleDiv = document.createElement('div');
            scheduleDiv.classList.add('schedule');
            const hour = document.createElement('span');
            hour.innerText = schedule.time + ':00';
            const nameIdentificationDiv = document.createElement('div');
            nameIdentificationDiv.classList.add('name-identification');
            const personName = document.createElement('span');
            personName.innerText = schedule.name;
            const animalName = document.createElement('span');
            animalName.innerText = '/ ' + schedule.animalName;
            nameIdentificationDiv.append(personName, animalName);
            scheduleDiv.append(hour, nameIdentificationDiv);

            const service = document.createElement('div');
            service.classList.add('service');
            const serviceDescription = document.createElement('span');
            serviceDescription.innerText = schedule.description;
            service.append(serviceDescription);

            const remove = document.createElement('div');
            remove.classList.add('remove');
            const removeButton = document.createElement('span');
            removeButton.classList.add('remove-item');
            removeButton.innerText = 'Remover agendamento';
            remove.append(removeButton);

            object.append(scheduleDiv, service, remove);
            period.append(object);
        })
    } catch (error) {
        alert('Não foi possível mostrar os horários agendados!');
    }

}

dayChoosen.addEventListener('change', async () => {
    const dayChoosen = document.querySelector('.dayChoosen input');
    await loadSchedules(dayChoosen.value);
})

newScheduleButton.addEventListener('click', () => {
    const dayToSchedule = document.querySelector('.date input');
    const timeToSchedule = document.querySelector('.time input');

    console.log('CLICOU!')
    main.classList.add('blur-container');
    form.classList.remove('dontShowForms');
    form.classList.add('showForms');
    newScheduleButton.classList.remove('buttonToSchedule');
    newScheduleButton.classList.add('dontShowButtonToSchedule');
    logo.classList.add('logoForms');


    dayToSchedule.value = today;
    dayToSchedule.min = today;
    timeToSchedule.value = time;

})

form.onsubmit = async (event) => {
    event.preventDefault;
    const personName = document.querySelector('.personNameInput input');
    const animalName = document.querySelector('.animalNameInput input');
    const phone = document.querySelector('.phoneInput input');
    const description = document.querySelector('.phoneInput input');
    const dayToSchedule = document.querySelector('.date input');
    const timeToSchedule = document.querySelector('.time input');
    const nowTime = dayjs(new Date()).valueOf().toString();

    
    try{
        const isDuplicate = await verifyDuplicateSchedules({dayToSchedule, timeToSchedule});
        console.log(isDuplicate)
        if(isDuplicate){
            throw new Error('Já existe um agendamento para essa data e horário');
        }

        const [choosenTime] = timeToSchedule.value.split(":");
        console.log(choosenTime);
        
        if(choosenTime < 9 || choosenTime > 21){
            throw new Error('Horário não permitido')
        }

        await fetch('http://localhost:3000/schedules',{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: nowTime, 
                name: personName.value.trim(), 
                animalName: animalName.value.trim(), 
                phone: phone.value.trim(),
                description: description.value.trim(),
                day: dayToSchedule.value,
                time: choosenTime
            })
        });
    }catch(error){
        console.log(error);
        alert(error);
    }
}

main.addEventListener('click', async (event) => {
    

    const isConfirm = confirm('Tem certeza que deseja deletar o agendamento?');

    if(isConfirm){
        if(event.target.classList.contains("remove-item")){
            const item = event.target.closest("li");
            console.log(item);
    
            const { id } = item.dataset;
        
            console.log(id);
            console.log(item.dataset);
            
            await removeItemFromDatabse({ id });

            item.remove();
        }
    }

})

async function removeItemFromDatabse({ id }) {

    const dayChoosen = document.querySelector('.dayChoosen input');

    try {
        await fetch(`http://localhost:3000/schedules/1770064808214`,{
            method: "DELETE"
        });

        await fetch(`http://localhost:3000/schedules/${id}`,{
            method: "DELETE"
        });
    } catch (error) {
        alert('Erro ao deletar agendamento');
    }

    await loadSchedules(dayChoosen);
}

async function verifyDuplicateSchedules({ dayToSchedule, timeToSchedule }){

    const [choosenTime] = timeToSchedule.value.split(":");

    try {
        const response = await fetch('http://localhost:3000/schedules');
        const data = await response.json();
        const duplicateSchedules = data.filter((schedules) => {
            return dayjs(dayToSchedule.value).isSame(schedules.day,'day') && choosenTime === schedules.time;
        });

        if(duplicateSchedules.length > 0){
            throw new Error('Já existe um agendamento para essa data e horário');
        }

    } catch (error) {
        return error;
    }
}