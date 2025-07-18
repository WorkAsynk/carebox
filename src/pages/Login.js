import React from 'react'
import LeftInfo from '../component/Login/LeftInfo'
import LoginForm from '../component/Login/LoginForm'

const Login = () => {
	return (
		<div className="min-h-screen flex flex-col lg:flex-row">
			<div className='w-[80%] bg-gray-200 flex justify-center items-center'>
				<LeftInfo />
			</div>
			<LoginForm />
		</div>
	)
}

export default Login